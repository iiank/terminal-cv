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

Node 20.19 or newer.

---

## Folder structure

```
terminal-cv/
├─ .github/...                  # GitHub Pages build and deploy
├─ index.html                   # mount point, first-paint theme, no-JS fallback
├─ package.json
├─ vite.config.js               # base path, build target, __BUILD_TIME__
└─ src/
   ├─ main.js                   # creates the app, imports the stylesheet
   ├─ App.vue                   # layout, tracks which file is open
   ├─ files.js                  # registry: file name, page component, data
   │
   ├─ components/
   │  ├─ TerminalWindow.vue     # the command prompt
   │  ├─ FileViewer.vue         # modal window that shows an open file
   │  ├─ FileIcon.vue           # file extension to icon
   │  ├─ ThemeSwitch.vue        # light and dark mode switch
   │  └─ pages/...              # one component per file
   │
   ├─ composables/
   │  ├─ useTerminal.js         # boot sequence, printing, commands
   │  └─ useTheme.js            # theme state and persistence
   │
   ├─ data/...                  # content for each page
   │
   ├─ utils/
   │  ├─ toLines.js             # string or array of strings to lines
   │  └─ wrapTokens.js          # hard-wraps editor lines at the fitting column
   │
   └─ styles/
      └─ main.css               # global stylesheet and design tokens
```

---

## Adjusting content

Everyday edits happen in `src/data/`. No component changes needed.

### Text fields accept two forms

Any field that runs through `toLines` takes a string or an array of lines.
JSON has no line continuation, so the nested form keeps a long sentence
readable in the editor.

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

1. Create `src/components/pages/MyPage.vue`. It receives its data as a `data` prop.
2. Add `src/data/my-page.json`.
3. Register both in `src/files.js`:

```js
import MyPage from './components/pages/MyPage.vue';
import myPage from './data/my-page.json';

// inside FILES
{ name: 'my_page.txt', component: MyPage, data: myPage }
```

It now appears in `git status` and `dir`, is clickable, gets the icon for its
extension, responds to `open my_page.txt`, and gets a row in the `git pull` stat.

For a text-style page, start from `AboutMe.vue`: it builds token lines and
wraps them to fit the editor window. A token is `{ t: text, c: classes }`;
`c` takes `dim`, `soft`, `bright`, `bold`, `italic` or `chip`, and `hang: true`
on a line's first token indents wrapped rows beneath it.

### Change the greeting, commands or git output

All in `src/composables/useTerminal.js`. `GREETING` is the opening lines,
`PULL_PREAMBLE` the fetch lines of the fake pull, and `handle()` the command list.
The diff stat is generated: insertions are the line count of each file's data,
and `BAR_WIDTH` caps the `+` bar so rows stay on one line on a phone.

### Change the prompt

`PROMPT` at the top of the same file. Backslashes need escaping: `'C:\\Users\\iiankhor>'`.

### Change the look

Colours, the shadow, the font stack and the three text sizes are tokens at the top
of `src/styles/main.css`. Phones raise the root font size, so all text scales together.
