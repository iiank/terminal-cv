/* All terminal behaviour: boot sequence, printing and commands.
   Kept out of the component so the markup stays readable. */

import { ref } from 'vue';
import { listedFiles } from '../files.js';

export const PROMPT = 'C:\\Users\\iiankhor>';

const GREETING = ['Hi!', 'My name is Iian!', 'What can I do for you?'];

const PULL_OUTPUT = [
  'remote: Enumerating objects: 42, done.',
  'remote: Counting objects: 100% (42/42), done.',
  'remote: Compressing objects: 100% (27/27), done.',
  'remote: Total 31 (delta 14), reused 24 (delta 9), pack-reused 0',
  'Unpacking objects: 100% (31/31), 12.84 KiB | 428.00 KiB/s, done.',
  'From https://github.com/iiankhor/portfolio',
  ' * branch            my-portfolio     -> FETCH_HEAD',
  '   3f9a1c2..b7d40e8  my-portfolio     -> origin/my-portfolio',
  'Updating 3f9a1c2..b7d40e8',
  'Fast-forward',
  ' about_me.md      |  24 ++++++++++',
  ' experiences.json |  63 ++++++++++++++++++++++',
  ' projects.ipynb   | 118 ++++++++++++++++++++++++++++++++++++',
  ' contact.txt      |   6 +++',
  ' last_updated.log |   9 ++++',
  ' 5 files changed, 220 insertions(+)'
];

const OPEN_VERBS = ['open', 'type', 'cat', 'code'];

export function useTerminal(options = {}) {
  const onOpenFile = options.onOpenFile || function () {};

  const lines = ref([]);
  const command = ref('');
  const busy = ref(true);
  const flashing = ref(false);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let nextId = 0;
  let interacted = false;

  /* ---------------------------- printing ---------------------------- */

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, reduceMotion ? Math.min(ms, 40) : ms);
    });
  }

  function push(line) {
    lines.value.push({ id: nextId += 1, ...line });
  }

  function printText(text, tone) {
    push({ kind: 'text', text: text || '', tone: tone || '' });
  }

  function printCommand(text) {
    push({ kind: 'command', text: text || '' });
  }

  function printFile(name) {
    push({ kind: 'file', name });
  }

  function showCursor() {
    removeCursor();
    push({ kind: 'cursor' });
  }

  function removeCursor() {
    const list = lines.value;
    if (list.length && list[list.length - 1].kind === 'cursor') { list.pop(); }
  }

  async function printBlock(block, delay) {
    for (let i = 0; i < block.length; i += 1) {
      printText(block[i], 'soft');
      await wait(delay);
    }
  }

  function idle() {
    showCursor();
    busy.value = false;
  }

  /* ------------------------------ boot ------------------------------ */

  async function boot() {
    busy.value = true;

    for (let i = 0; i < GREETING.length; i += 1) {
      printText(GREETING[i], 'bright');
      await wait(420);
    }

    showCursor();
    await wait(600);

    /* Types the first command into the box, then invites the visitor
       to press Enter themselves. */
    command.value = '';
    for (const character of 'git pull origin my-portfolio') {
      command.value += character;
      await wait(55);
    }

    flashing.value = true;
    busy.value = false;
  }

  /* ---------------------------- commands ---------------------------- */

  async function runGitPull() {
    await wait(300);
    await printBlock(PULL_OUTPUT, 110);
  }

  async function runGitStatus() {
    printText('On branch my-portfolio', 'soft');
    printText("Your branch is up to date with 'origin/my-portfolio'.", 'soft');
    printText('');
    await wait(220);

    printText('Untracked files:', 'bright');
    printText('  (Click the files below to read more!)', 'dim');
    printText('');

    const names = listedFiles();
    for (let i = 0; i < names.length; i += 1) {
      printFile(names[i]);
      await wait(140);
    }

    printText('');
    printText('nothing added to commit but untracked files present', 'dim');
    printText('');
  }

  function printHelp() {
    printText('Available commands:', 'bright');
    printText('  dir                 list the untracked files', 'soft');
    printText('  open <file>         open a file, for example: open contact.txt', 'soft');
    printText('  git status          show the untracked files again', 'soft');
    printText('  cls                 clear the terminal', 'soft');
    printText('  help                show this list', 'soft');
    printText('');
  }

  function printFileList() {
    printText('Untracked files in C:\\Users\\iiankhor:', 'soft');
    listedFiles().forEach(printFile);
    printText('');
  }

  function matchFile(word) {
    const target = String(word || '').toLowerCase();

    return listedFiles().find(function (name) {
      return name.toLowerCase() === target || name.split('.')[0].toLowerCase() === target;
    }) || null;
  }

  async function handle(raw) {
    const text = raw.trim();
    const lower = text.toLowerCase();

    if (text === '') { return; }

    if (lower === 'git pull origin my-portfolio' || lower === 'git pull') {
      await runGitPull();
      printText('');
      await wait(400);

      printCommand('git status');
      await wait(300);
      await runGitStatus();
      return;
    }

    if (lower === 'git status') { await runGitStatus(); return; }
    if (lower === 'help' || lower === '?') { printHelp(); return; }
    if (lower === 'cls' || lower === 'clear') { lines.value = []; return; }
    if (lower === 'dir' || lower === 'ls') { printFileList(); return; }

    if (lower === 'exit') {
      printText('This window cannot be closed. Try help instead.', 'dim');
      printText('');
      return;
    }

    const direct = matchFile(text);
    if (direct) { onOpenFile(direct); return; }

    const parts = text.split(/\s+/);
    if (OPEN_VERBS.includes(parts[0].toLowerCase())) {
      const named = parts.length > 1 ? matchFile(parts[1]) : null;
      if (named) {
        onOpenFile(named);
      } else {
        printText('The system cannot find the file specified.', 'dim');
        printText('');
      }
      return;
    }

    printText("'" + text + "' is not recognised as an internal or external command,", 'dim');
    printText('operable program or batch file.', 'dim');
    printText('');
  }

  async function submit() {
    if (busy.value) { return; }

    const text = command.value;
    interacted = true;
    flashing.value = false;
    busy.value = true;

    removeCursor();
    printCommand(text);
    command.value = '';

    await handle(text);
    idle();
  }

  function hasInteracted() {
    return interacted;
  }

  return { lines, command, busy, flashing, boot, submit, hasInteracted };
}
