/* Terminal behaviour: boot sequence, printing and commands. Kept out of the
   component so the markup stays readable. */

import { ref } from 'vue';
import { getFile, fileNames } from '../files.js';

export const PROMPT = 'C:\\Users\\iiankhor> ';

const GREETING = ['Hi!', 'My name is Iian!', 'What can I do for you?'];

const PULL_PREAMBLE = [
  'remote: Enumerating objects: 42, done.',
  'remote: Counting objects: 100% (42/42), done.',
  'remote: Compressing objects: 100% (27/27), done.',
  'remote: Total 31 (delta 14), reused 24 (delta 9), pack-reused 0',
  'Unpacking objects: 100% (31/31), 12.84 KiB | 428.00 KiB/s, done.',
  'From https://github.com/iiankhor/portfolio',
  ' * branch            my-portfolio     -> FETCH_HEAD',
  '   3f9a1c2..b7d40e8  my-portfolio     -> origin/my-portfolio',
  'Updating 3f9a1c2..b7d40e8',
  'Fast-forward'
];

/* Longest diff stat bar, in '+' characters. At 10 every row fits on one line
   of a 360px-wide phone; check that before raising it. */
const BAR_WIDTH = 10;

const OPEN_VERBS = ['open', 'type', 'cat', 'code'];
const COMMAND_WORDS = ['git pull origin my-portfolio', 'git status', 'help', 'dir', 'cls', 'exit', 'open '];
const HISTORY_LIMIT = 50;

/* Insertions are the lines in each file's data, pretty-printed, so the stat
   follows the content without hand-kept numbers. */
function insertions(name) {
  return JSON.stringify(getFile(name).data, null, 2).split('\n').length;
}

/* Laid out like git: names padded to one width, counts right aligned and bars
   scaled against the largest change. */
function diffStat() {
  const names = fileNames();
  const counts = names.map(insertions);
  const largest = Math.max(...counts);
  const widest = Math.max(...names.map(function (name) { return name.length; }));
  const digits = String(largest).length;

  const rows = names.map(function (name, index) {
    const bar = '+'.repeat(Math.max(1, Math.round((counts[index] / largest) * BAR_WIDTH)));
    return ' ' + name.padEnd(widest) + ' | ' + String(counts[index]).padStart(digits) + ' ' + bar;
  });

  const total = counts.reduce(function (sum, count) { return sum + count; }, 0);
  const changed = names.length === 1 ? '1 file changed' : names.length + ' files changed';
  rows.push(' ' + changed + ', ' + total + ' insertions(+)');

  return rows;
}

export function useTerminal(onOpenFile) {
  const lines = ref([]);
  const command = ref('');
  const busy = ref(true);
  const flashing = ref(false);

  /* Read by a hidden live region, so a screen reader hears one summary
     rather than every line of git output. */
  const status = ref('');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let nextId = 0;
  let interacted = false;

  const history = [];
  let historyAt = null;
  let draft = '';

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
    push({ kind: 'command', text });
  }

  function printFile(name) {
    push({ kind: 'file', name });
  }

  function removeCursor() {
    const list = lines.value;
    if (list.length && list[list.length - 1].kind === 'cursor') { list.pop(); }
  }

  function showCursor() {
    removeCursor();
    push({ kind: 'cursor' });
  }

  async function printBlock(block, delay) {
    for (const text of block) {
      printText(text, 'soft');
      await wait(delay);
    }
  }

  /* ------------------------------ boot ------------------------------ */

  /* Greets, then types the first command into the box and leaves the
     visitor to press Enter. */
  async function boot() {
    for (const text of GREETING) {
      printText(text, 'bright');
      await wait(420);
    }

    showCursor();
    await wait(600);

    for (const character of 'git pull origin my-portfolio') {
      command.value += character;
      await wait(55);
    }

    flashing.value = true;
    busy.value = false;
    status.value = 'Terminal ready. The command git pull origin my-portfolio is waiting in the box. Press Enter to run it.';
  }

  /* ---------------------------- commands ---------------------------- */

  async function runGitPull() {
    await wait(300);
    await printBlock(PULL_PREAMBLE, 110);
    await printBlock(diffStat(), 110);
  }

  async function runGitStatus() {
    printText('On branch my-portfolio', 'soft');
    printText("Your branch is up to date with 'origin/my-portfolio'.", 'soft');
    printText('');
    await wait(220);

    printText('Untracked files:', 'bright');
    printText('  (Select the files below to read more!)', 'dim');
    printText('');

    const names = fileNames();
    for (const name of names) {
      printFile(name);
      await wait(140);
    }

    printText('');
    printText('nothing added to commit but untracked files present', 'dim');
    printText('');

    status.value = names.length + ' untracked files listed: ' + names.join(', ')
      + '. Select one to open it, or type open followed by the file name.';
  }

  function printHelp() {
    printText('Available commands:', 'bright');
    printText('  dir                 list the untracked files', 'soft');
    printText('  open <file>         open a file, for example: open contact.txt', 'soft');
    printText('  git status          show the untracked files again', 'soft');
    printText('  cls                 clear the terminal', 'soft');
    printText('  help                show this list', 'soft');
    printText('');
    printText('  Tab completes a file name. The up and down arrows step', 'dim');
    printText('  through commands already run.', 'dim');
    printText('');
    status.value = 'Command list printed.';
  }

  function printFileList() {
    printText('Untracked files in C:\\Users\\iiankhor:', 'soft');
    fileNames().forEach(printFile);
    printText('');
    status.value = 'Files listed: ' + fileNames().join(', ') + '.';
  }

  /* Matches a full file name or just its stem, ignoring case. */
  function matchFile(word) {
    const target = String(word || '').toLowerCase();
    if (!target) { return null; }

    return fileNames().find(function (name) {
      return name.toLowerCase() === target || name.split('.')[0].toLowerCase() === target;
    }) || null;
  }

  function open(name) {
    status.value = 'Opening ' + name + '.';
    onOpenFile(name);
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

    if (lower === 'cls' || lower === 'clear') {
      lines.value = [];
      status.value = 'Terminal cleared.';
      return;
    }

    if (lower === 'dir' || lower === 'ls') { printFileList(); return; }

    if (lower === 'exit') {
      printText('This window cannot be closed. Try help instead.', 'dim');
      printText('');
      status.value = 'This window cannot be closed.';
      return;
    }

    const direct = matchFile(text);
    if (direct) { open(direct); return; }

    const parts = text.split(/\s+/);
    if (OPEN_VERBS.includes(parts[0].toLowerCase())) {
      const named = matchFile(parts[1]);
      if (named) {
        open(named);
      } else {
        printText('The system cannot find the file specified.', 'dim');
        printText('');
        status.value = 'The system cannot find the file specified.';
      }
      return;
    }

    printText("'" + text + "' is not recognised as an internal or external command,", 'dim');
    printText('operable program or batch file.', 'dim');
    printText('');
    status.value = text + ' is not recognised. Type help for the list of commands.';
  }

  /* ---------------------------- recall -------------------------------- */

  function remember(text) {
    if (!text || history[history.length - 1] === text) { return; }

    history.push(text);
    if (history.length > HISTORY_LIMIT) { history.shift(); }
  }

  /* -1 steps back through earlier commands, 1 steps forward. Going past the
     newest entry restores whatever was half typed. */
  function recall(step) {
    if (busy.value || !history.length) { return; }

    if (historyAt === null) {
      draft = command.value;
      historyAt = history.length;
    }

    historyAt = Math.min(history.length, Math.max(0, historyAt + step));
    command.value = historyAt === history.length ? draft : history[historyAt];
  }

  /* ---------------------------- completion ---------------------------- */

  function commonPrefix(values) {
    return values.reduce(function (prefix, value) {
      let i = 0;
      while (i < prefix.length && i < value.length
        && prefix[i].toLowerCase() === value[i].toLowerCase()) { i += 1; }
      return prefix.slice(0, i);
    });
  }

  function complete() {
    if (busy.value) { return; }

    const text = command.value;
    const verb = text.match(/^(\w+)(\s+)(.*)$/);
    const useVerb = verb && OPEN_VERBS.includes(verb[1].toLowerCase());
    const stem = useVerb ? verb[3] : text;
    const prefix = useVerb ? verb[1] + verb[2] : '';

    if (!stem) { return; }

    const pool = useVerb ? fileNames() : fileNames().concat(COMMAND_WORDS);
    const hits = pool.filter(function (name) {
      return name.toLowerCase().startsWith(stem.toLowerCase());
    });

    if (!hits.length) { return; }

    if (hits.length === 1) {
      command.value = prefix + hits[0];
      status.value = 'Completed to ' + hits[0] + '.';
      return;
    }

    command.value = prefix + commonPrefix(hits);

    removeCursor();
    printCommand(text);
    printText(hits.join('   '), 'soft');
    printText('');
    showCursor();
    status.value = hits.length + ' matches: ' + hits.join(', ') + '.';
  }

  /* ---------------------------- submit -------------------------------- */

  async function submit() {
    if (busy.value) { return; }

    const text = command.value;
    interacted = true;
    flashing.value = false;
    busy.value = true;

    remember(text.trim());
    historyAt = null;
    draft = '';

    removeCursor();
    printCommand(text);
    command.value = '';

    await handle(text);
    showCursor();
    busy.value = false;
  }

  function hasInteracted() {
    return interacted;
  }

  return { lines, command, busy, flashing, status, boot, submit, recall, complete, hasInteracted };
}
