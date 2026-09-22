<script setup>
import { ref } from 'vue';
import { toLines } from '../../utils/toLines.js';

const props = defineProps({
  data: { type: Object, required: true }
});

const intro = toLines(props.data.intro);
const note = ref('');

/* Selects the text first so a blocked clipboard still leaves it ready to copy.
   iOS ignores select() on read-only fields, hence the explicit range. */
async function copyField(field) {
  const input = document.getElementById(field.id);
  input.select();
  input.setSelectionRange(0, field.value.length);

  try {
    await navigator.clipboard.writeText(field.value);
    note.value = field.value + ' copied to the clipboard.';
  } catch (error) {
    note.value = 'Copy is blocked here. The text is selected, so copy it manually.';
  }
}
</script>

<template>
  <div class="contact">
    <div class="contact__intro">
      <p v-for="(paragraph, part) in intro" :key="part">{{ paragraph }}</p>
    </div>

    <div v-for="field in props.data.fields" :key="field.id" class="contact__field">
      <label :for="field.id">{{ field.label }}</label>
      <div class="contact__row">
        <input :id="field.id" type="text" :value="field.value" readonly>
        <button class="contact__copy" type="button" @click="copyField(field)">Copy</button>
      </div>
    </div>

    <p class="contact__note" role="status">{{ note }}</p>
  </div>
</template>
