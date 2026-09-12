<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import FileIcon from './FileIcon.vue';

const props = defineProps({
  name: { type: String, required: true },
  view: { type: [Object, Function], default: null }
});

const emit = defineEmits(['close']);

const closeBtn = ref(null);

let lastFocused = null;

function onKeydown(event) {
  if (event.key === 'Escape') { emit('close'); }
}

onMounted(function () {
  lastFocused = document.activeElement;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', onKeydown);
  if (closeBtn.value) { closeBtn.value.focus({ preventScroll: true }); }
});

onBeforeUnmount(function () {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onKeydown);
  if (lastFocused && document.contains(lastFocused)) {
    lastFocused.focus({ preventScroll: true });
  }
});
</script>

<template>
  <div class="viewer">
    <div class="viewer__backdrop" @click="emit('close')"></div>

    <section
      class="window window--viewer"
      role="dialog"
      aria-modal="true"
      :aria-label="name">
      <div class="titlebar">
        <FileIcon class="titlebar__icon titlebar__icon--file" :name="name" />
        <h2 class="titlebar__title">{{ name }}</h2>
        <div class="titlebar__controls">
          <button
            ref="closeBtn"
            class="titlebar__btn titlebar__btn--close titlebar__btn--action"
            type="button"
            aria-label="Close file"
            @click="emit('close')">&times;</button>
        </div>
      </div>

      <div class="viewer__body">
        <component :is="view" v-if="view" />
      </div>
    </section>
  </div>
</template>
