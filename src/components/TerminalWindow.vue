<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { useTerminal, PROMPT } from '../composables/useTerminal.js';
import FileIcon from './FileIcon.vue';

const emit = defineEmits(['open-file']);

const output = ref(null);
const inputEl = ref(null);

const { lines, command, busy, flashing, boot, submit, hasInteracted } = useTerminal({
  onOpenFile: function (name) { emit('open-file', name); }
});

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
      <h1 class="titlebar__title">Terminal.exe</h1>
      <div class="titlebar__controls" aria-hidden="true">
        <span class="titlebar__btn">_</span>
        <span class="titlebar__btn">&#9633;</span>
        <span class="titlebar__btn titlebar__btn--close">&times;</span>
      </div>
    </div>

    <div
      ref="output"
      class="terminal"
      role="log"
      aria-live="polite"
      aria-label="Terminal output">
      <p v-for="line in lines" :key="line.id" :class="{ 'is-file': line.kind === 'file' }">
        <template v-if="line.kind === 'text'"><span :class="line.tone">{{ line.text }}</span></template>
        <template v-else-if="line.kind === 'command'"><span class="soft">{{ PROMPT }}</span><span class="bright">{{ line.text }}</span></template>
        <template v-else-if="line.kind === 'file'"><button type="button" class="file-link" @click="emit('open-file', line.name)"><FileIcon class="file-link__icon" :name="line.name" />{{ line.name }}</button></template>
        <template v-else><span class="soft">{{ PROMPT }}</span><span class="cursor" aria-hidden="true"></span></template>
      </p>
    </div>

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
        @keydown.enter.prevent="submit">
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
