<script setup>
import { ref, computed } from 'vue';
import ThemeSwitch from './components/ThemeSwitch.vue';
import TerminalWindow from './components/TerminalWindow.vue';
import FileViewer from './components/FileViewer.vue';
import { getFile } from './files.js';

const activeFile = ref(null);

const activeComponent = computed(function () {
  const file = activeFile.value ? getFile(activeFile.value) : null;
  return file ? file.component : null;
});

function openFile(name) {
  if (getFile(name)) { activeFile.value = name; }
}

function closeFile() {
  activeFile.value = null;
}
</script>

<template>
  <main class="screen">
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
