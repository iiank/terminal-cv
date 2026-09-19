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
} = useTerminal({
  onOpenFile: function (name) { emit('open-file', name); }
});

/* Tab completes a file name, but only when there is something to complete.
   An empty box lets Tab move focus on, so the keyboard is never trapped
   here, and Shift and Tab together always leaves. */
function onTab(event) {
  if (event.shiftKey || !command.value.trim()) { return; }
  event.preventDefault();
  complete();
}

/* Keep the newest line in view. */
watch(function () { return lines.value.length; }, async function () {
  await nextTick();
  if (output.value) { output.value.scrollTop = output.value.scrollHeight; }
});

/* Return the caret to the box once a command finishes, but never before the
   visitor has tapped anything, so mobile keyboards stay shut on arrival. */
watch(busy, async function (value) {
  if (value || !hasInteracted()) { return; }
  await nextTick();
  if (inputEl.value) { inputEl.value.focus({ preventScroll: true }); }
});

onMounted(boot);
</script>

<template>
  <section class="window window--terminal" aria-label="Terminal">
    <div class="titlebar">
      <span class="titlebar__icon" aria-hidden="true"></span>
      <p class="titlebar__title">Terminal.exe</p>
      <div class="titlebar__controls" aria-hidden="true">
        <span class="titlebar__btn">_</span>
        <span class="titlebar__btn">&#9633;</span>
        <span class="titlebar__btn titlebar__btn--close">&times;</span>
      </div>
    </div>

    <!-- A plain scrollable region rather than a live log: announcing every
         line would read sixteen lines of git plumbing aloud before reaching
         anything about Iian. The summary below carries the meaning instead. -->
    <div
      ref="output"
      class="terminal"
      role="region"
      tabindex="0"
      aria-label="Terminal output">
      <p v-for="line in lines" :key="line.id" :class="{ 'is-file': line.kind === 'file' }">
        <template v-if="line.kind === 'text'"><span :class="line.tone">{{ line.text }}</span></template>
        <template v-else-if="line.kind === 'command'"><span class="soft">{{ PROMPT }}</span><span class="bright">{{ line.text }}</span></template>
        <template v-else-if="line.kind === 'file'"><button type="button" class="file-link" @click="emit('open-file', line.name)"><FileIcon class="file-link__icon" :name="line.name" />{{ line.name }}</button></template>
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
        class="promptbar__input"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        :disabled="busy"
        @keydown.enter.prevent="submit"
        @keydown.up.prevent="recall(-1)"
        @keydown.down.prevent="recall(1)"
        @keydown.tab="onTab">
      <button
        class="promptbar__button"
        :class="{ 'is-flashing': flashing }"
        type="button"
        :disabled="busy"
        @click="submit">
        Enter
      </button>
    </div>
  </section>
</template>
