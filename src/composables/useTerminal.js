/* All terminal behaviour: boot sequence, printing and commands.
   Kept out of the component so the markup stays readable. */

import { ref } from 'vue';
import { listedFiles, allFiles } from '../files.js';

export const PROMPT = 'C:\\Users\\iiankhor>';

const GREETING = ['Hi!', 'My name is Iian!', 'What can I do for you?'];

/* The fetch preamble is fixed; the diff stat below is generated from the
   registered files so it can never drift when a page is added. */
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

/* Insertions quoted per file. Anything not listed falls back to a figure
   derived from the name, so a new page still gets a plausible row. */
const INSERTIONS = {
  'about_me.md': 24,
  'experiences.json': 63,
  'projects.ipynb': 118,
  'contact.txt': 6,
  'last_updated.log': 9
};

const BAR_WIDTH = 34;

function insertionsFor(name) {
  return INSERTIONS[name] || name.length * 4;
}

/* Reproduces the shape of a git diff stat: names padded to a common width,
   counts right aligned, bars scaled against the largest change. */
function diffStat() {
  const names = listedFiles();
  if (!names.length) { return []; }

  const counts = names.map(insertionsFor);
  const widest = Math.max(...names.map((name) => name.length));
  const digits = Math.max(...counts.map((count) => String(count).length));
  const largest = Math.max(...counts);

  const rows = names.map(function (name, index) {
    const count = counts[index];
    const bar = '+'.repeat(Math.max(1, Math.round((count / largest) * BAR_WIDTH)));
    return ' ' + name.padEnd(widest) + ' | ' + String(count).padStart(digits) + ' ' + bar;
  });

  const total = counts.reduce(function (sum, count) { return sum + count; }, 0);
  const files = names.length === 1 ? '1 file changed' : names.length + ' files changed';
  rows.push(' ' + files + ', ' + total + ' insertions(+)');

  return rows;
}

const OPEN_VERBS = ['open', 'type', 'cat', 'code'];
const COMMAND_WORDS = ['git pull origin my-portfolio', 'git status', 'help', 'dir', 'cls', 'exit', 'open '];
const HISTORY_LIMIT = 50;

export function useTerminal(options = {}) {
  const onOpenFile = options.onOpenFile || function () {};

  const lines = ref([]);
  const command = ref('');
  const busy = ref(true);
  const flashing = ref(false);

  /* Read by a visually hidden live region. The terminal itself is not a live
     region, so a screen reader hears one summary rather than every line of
     git plumbing as it prints. */
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

    const names = listedFiles();
    for (let i = 0; i < names.length; i += 1) {
      printFile(names[i]);
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
    listedFiles().forEach(printFile);
    printText('');
    status.value = 'Files listed: ' + listedFiles().join(', ') + '.';
  }

  /* Opening matches every registered file, including any marked
     listed: false, so a hidden page stays off the lists but can still be
     reached by anyone who knows its name. */
  function matchFile(word, pool) {
    const target = String(word || '').toLowerCase();
    if (!target) { return null; }

    return (pool || allFiles()).find(function (name) {
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
      const named = parts.length > 1 ? matchFile(parts[1]) : null;
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
    if (!text) { return; }
    if (history[history.length - 1] === text) { return; }

    history.push(text);
    if (history.length > HISTORY_LIMIT) { history.shift(); }
  }

  /* step of -1 walks back through earlier commands, 1 walks forward.
     Stepping past the newest entry restores whatever was half typed. */
  function recall(step) {
    if (busy.value || !history.length) { return; }

    if (historyAt === null) {
      draft = command.value;
      historyAt = history.length;
    }

    const target = Math.min(history.length, Math.max(0, historyAt + step));
    historyAt = target;
    command.value = target === history.length ? draft : history[target];
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

  /* Completes against listed files only, so hidden pages are not revealed
     by pressing Tab. */
  function complete() {
    if (busy.value) { return; }

    const text = command.value;
    if (!text.trim()) { return; }

    const verb = text.match(/^(\w+)(\s+)(.*)$/);
    const useVerb = verb && OPEN_VERBS.includes(verb[1].toLowerCase());
    const stem = useVerb ? verb[3] : text;
    const prefix = useVerb ? verb[1] + verb[2] : '';

    if (!stem) { return; }

    const pool = useVerb ? listedFiles() : listedFiles().concat(COMMAND_WORDS);
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
    idle();
  }

  function hasInteracted() {
    return interacted;
  }

  return { lines, command, busy, flashing, status, boot, submit, recall, complete, hasInteracted };
}
