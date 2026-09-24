<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { useTerminal, PROMPT } from '../composables/useTerminal.js';
import FileIcon from './FileIcon.vue';

const emit = defineEmits(['open-file']);

const output = ref(null);
const inputEl = ref(null);

const {
  lines, command, busy, flashing, status,
  boot, submit, recall, complete, hasInteracted
} = useTerminal(function (name) { emit('open-file', name); });

const finePointer = window.matchMedia('(pointer: fine)').matches;

/* Tab completes only when there is something to complete, so an empty box
   still lets Tab and Shift+Tab move focus on. */
function onTab(event) {
  if (event.shiftKey || !command.value.trim()) { return; }
  event.preventDefault();
  complete();
}

watch(function () { return lines.value.length; }, async function () {
  await nextTick();
  output.value.scrollTop = output.value.scrollHeight;
});

/* Returns the caret once a command finishes, but only with a mouse and after
   the first interaction, so a phone keyboard never opens by itself. */
watch(busy, async function (value) {
  if (value || !finePointer || !hasInteracted()) { return; }
  await nextTick();
  inputEl.value.focus({ preventScroll: true });
});

onMounted(boot);
</script>

<template>
  <section class="window window-terminal" aria-label="Terminal">
    <div class="titlebar">
      <span class="titlebar-icon" aria-hidden="true"></span>
      <p class="titlebar-title">Terminal.exe</p>
      <div class="titlebar-controls" aria-hidden="true">
        <span class="titlebar-btn">_</span>
        <span class="titlebar-btn">&#9633;</span>
        <span class="titlebar-btn titlebar-btn-close">&times;</span>
      </div>
    </div>

    <!-- Deliberately not a live region: the status line below announces one
         summary instead of every line of git output. -->
    <div
      ref="output"
      class="terminal"
      role="region"
      tabindex="0"
      aria-label="Terminal output">
      <p v-for="line in lines" :key="line.id" :class="{ 'is-file': line.kind === 'file' }">
        <template v-if="line.kind === 'text'"><span :class="line.tone">{{ line.text }}</span></template>
        <template v-else-if="line.kind === 'command'"><span class="soft">{{ PROMPT }}</span><span class="bright">{{ line.text }}</span></template>
        <template v-else-if="line.kind === 'file'"><button type="button" class="file-link" @click="emit('open-file', line.name)"><FileIcon class="file-link-icon" :name="line.name" />{{ line.name }}</button></template>
        <template v-else><span class="soft">{{ PROMPT }}</span><span class="cursor" aria-hidden="true"></span></template>
      </p>
    </div>

    <p class="sr-only" role="status">{{ status }}</p>

    <div class="promptbar">
      <label class="sr-only" for="command-input">Type a command</label>
      <input
        id="command-input"
        ref="inputEl"
        v-model="command"
        class="promptbar-input"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        enterkeyhint="go"
        :disabled="busy"
        @keydown.enter.prevent="submit"
        @keydown.up.prevent="recall(-1)"
        @keydown.down.prevent="recall(1)"
        @keydown.tab="onTab">
      <button
        class="promptbar-button"
        :class="{ 'is-flashing': flashing }"
        type="button"
        :disabled="busy"
        @click="submit">
        Enter
      </button>
    </div>
  </section>
</template>
