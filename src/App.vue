<script setup>
/* The open file lives in the URL hash, so a page can be linked to directly
   and the back button closes the viewer rather than leaving the site. */

import { shallowRef, onMounted, onBeforeUnmount } from 'vue';
import ThemeSwitch from './components/ThemeSwitch.vue';
import TerminalWindow from './components/TerminalWindow.vue';
import FileViewer from './components/FileViewer.vue';
import { getFile } from './files.js';

/* Shallow, because the entry holds a component that must not be made reactive. */
const activeFile = shallowRef(null);

/* True when this tab pushed the hash, so closing can step back. A visitor who
   arrived on a link has nowhere to go back to, so the hash is cleared instead. */
let pushedHash = false;

function syncFromHash() {
  activeFile.value = getFile(decodeURIComponent(window.location.hash.slice(1)));
  if (!activeFile.value) { pushedHash = false; }
}

function openFile(name) {
  pushedHash = true;
  window.location.hash = encodeURIComponent(name);
}

function closeFile() {
  if (pushedHash) {
    pushedHash = false;
    window.history.back();
    return;
  }

  /* replaceState fires no hashchange, so the viewer is closed by hand. */
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  activeFile.value = null;
}

onMounted(function () {
  syncFromHash();
  window.addEventListener('hashchange', syncFromHash);
});

onBeforeUnmount(function () {
  window.removeEventListener('hashchange', syncFromHash);
});
</script>

<template>
  <!-- inert keeps the keyboard inside the viewer while a file is open. -->
  <main class="screen" :inert="activeFile ? true : null">
    <h1 class="sr-only">Iian Khor</h1>

    <header class="topbar">
      <ThemeSwitch />
    </header>

    <TerminalWindow @open-file="openFile" />

    <p class="hint">Type <span>help</span> once the terminal is ready.</p>
  </main>

  <FileViewer v-if="activeFile" :file="activeFile" @close="closeFile" />
</template>
