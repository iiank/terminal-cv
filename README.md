# Terminal CV

A portfolio website that opens as a Windows-style command prompt. Visitors are greeted,
a `git pull` types itself into the input box, and running it reveals untracked files they can click to read.

---

## Getting started

```bash
npm install
npm run dev         # dev server
npm run build       # production build into dist/
npm run preview     # serve the built output locally
```

Node 20 or newer.

---

## Folder structure

```
terminal-cv/
├─ .github/...                  # GitHub Pages build and deploy
├─ index.html                   # mount point, nothing else
├─ package.json
├─ vite.config.js               # base path, build target, __BUILD_TIME__
└─ src/
   ├─ main.js                   # creates the app, imports the stylesheet
   ├─ App.vue                   # layout, tracks which file is open
   ├─ files.js                  # registry: file name to component
   │
   ├─ components/...            # UI components
   │
   ├─ composables/
   │  ├─ useTerminal.js         # boot sequence, printing, commands
   │  └─ useTheme.js            # theme state and persistence
   │
   ├─ data/...                  # content for each component
   │
   ├─ utils/
   │  ├─ toLines.js             # convert string / array of strings to lines
   │  └─ wrapTokens.js          # hard-wraps editor lines at the fitting column
   │
   └─ styles/
      └─ main.css               # global stylesheet
```

## Adjusting content

Everyday edits happen in `src/data/`. No component changes needed.

### Text fields accept two forms

Any field that runs through `toLines` takes a string or an array of lines.
JSON has no backslash continuation, so the nested form is how a
long sentence stays readable in the editor.

```json
"body": "One line."

"body": [
  "First line.",
  "Second line, deliberately separate."
]
```

---

## Adjusting structure

### Add a page

1. Create `src/components/pages/MyPage.vue`, reading its own file from `src/data/`.
2. Add `src/data/my-page.json`.
3. Register it in `src/files.js`:

```js
import MyPage from './components/pages/MyPage.vue';
registerFile('my_page.txt', MyPage);
```

It now appears in `git status` and `dir`, is clickable, opens with a `.txt` icon, and responds to `open my_page.txt`.

### Change the greeting, commands or git output

All in `src/composables/useTerminal.js`. `GREETING` is the opening lines,
`PULL_OUTPUT` the fake pull, and `handle()` the command list. Update the
diffstat in `PULL_OUTPUT` when the number of files changes.

### Change the prompt

`PROMPT` at the top of the same file. Backslashes need escaping: `'C:\\Users\\iiankhor>'`.