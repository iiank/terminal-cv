<script setup>
import { ref } from 'vue';
import data from '../../data/contact.json';
import { toLines } from '../../utils/toLines.js';

const fields = data.fields;
const intro = toLines(data.intro);
const note = ref('');

async function copyField(field, event) {
  const input = event.target.closest('.contact__row').querySelector('input');
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

    <div v-for="field in fields" :key="field.id" class="contact__field">
      <label :for="field.id">{{ field.label }}</label>
      <div class="contact__row">
        <input :id="field.id" type="text" :value="field.value" readonly>
        <button class="contact__copy" type="button" @click="copyField(field, $event)">Copy</button>
      </div>
    </div>

    <p class="contact__note" role="status">{{ note }}</p>
  </div>
</template>