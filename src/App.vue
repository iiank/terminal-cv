<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import ThemeSwitch from './components/ThemeSwitch.vue';
import TerminalWindow from './components/TerminalWindow.vue';
import FileViewer from './components/FileViewer.vue';
import { getFile } from './files.js';

/* The open file lives in the URL hash, so a page can be linked to directly
   and the browser back button closes the viewer rather than leaving the
   site. The hash is the single source of truth; activeFile follows it. */
const activeFile = ref(null);

/* Tracks whether this tab pushed the hash itself. If it did, closing can go
   back a step. If the visitor arrived on a link, going back would leave the
   site, so the hash is cleared in place instead. */
let pushedHash = false;

const activeComponent = computed(function () {
  const file = activeFile.value ? getFile(activeFile.value) : null;
  return file ? file.component : null;
});

function fileFromHash() {
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  return raw && getFile(raw) ? raw : null;
}

function syncFromHash() {
  const name = fileFromHash();
  if (!name) { pushedHash = false; }
  activeFile.value = name;
}

function openFile(name) {
  if (!getFile(name)) { return; }

  pushedHash = true;
  window.location.hash = encodeURIComponent(name);
}

function closeFile() {
  if (pushedHash) {
    pushedHash = false;
    window.history.back();
    return;
  }

  /* replaceState fires no hashchange, so the state is cleared by hand. */
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
  <!-- inert holds the keyboard inside the viewer while a file is open. -->
  <main class="screen" :inert="activeFile ? true : null">
    <h1 class="sr-only">Iian Khor</h1>

    <header class="topbar">
      <ThemeSwitch />
    </header>

    <TerminalWindow @open-file="openFile" />

    <p class="hint">Type <span>help</span> once the terminal is ready.</p>
  </main>

  <FileViewer
    v-if="activeFile"
    :name="activeFile"
    :view="activeComponent"
    @close="closeFile" />
</template>
