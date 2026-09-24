<script setup>
import { ref } from 'vue';
import EmailIcon from '~icons/mdi/email-outline';
import GithubIcon from '~icons/mdi/github';
import LinkedinIcon from '~icons/mdi/linkedin';
import CopyIcon from '~icons/mdi/content-copy';
import { toLines } from '../../utils/toLines.js';

const props = defineProps({
  data: { type: Object, required: true }
});

const intro = toLines(props.data.intro);
const note = ref('');

const ICONS = {
  'contact-email': EmailIcon,
  'contact-github': GithubIcon,
  'contact-linkedin': LinkedinIcon
};

/* Throws rather than rendering a label with a gap where its icon belongs. */
function iconFor(id) {
  if (!ICONS[id]) { throw new Error('contact.json field has no icon: ' + id); }
  return ICONS[id];
}

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
    <div class="contact-intro">
      <p v-for="(paragraph, part) in intro" :key="part">{{ paragraph }}</p>
    </div>

    <div v-for="field in props.data.fields" :key="field.id" class="contact-field">
      <label :for="field.id">
        <component :is="iconFor(field.id)" class="contact-icon" aria-hidden="true" />{{ field.label }}
      </label>
      <div class="contact-row">
        <input :id="field.id" type="text" :value="field.value" readonly>
        <button
          class="contact-copy"
          type="button"
          :aria-label="'Copy ' + field.label"
          @click="copyField(field)">
          <CopyIcon class="contact-copy-icon" aria-hidden="true" />
        </button>
      </div>
    </div>

    <p class="contact-note" role="status">{{ note }}</p>
  </div>
</template>
