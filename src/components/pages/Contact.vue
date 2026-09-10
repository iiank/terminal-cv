<script setup>
import { ref } from 'vue';

const fields = [
  { id: 'contact-email', label: 'Email', value: 'iiankhr@gmail.com' },
  { id: 'contact-github', label: 'GitHub', value: 'github.com/iiank' },
  { id: 'contact-linkedin', label: 'LinkedIn', value: 'linkedin.com/in/iiank' }
];

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
    <p class="contact__intro">Three ways to reach me.</p>

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
