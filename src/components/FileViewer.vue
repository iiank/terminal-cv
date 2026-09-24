<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import FileIcon from './FileIcon.vue';

defineProps({
  file: { type: Object, required: true }
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
  closeBtn.value.focus({ preventScroll: true });
});

onBeforeUnmount(function () {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onKeydown);
  if (document.contains(lastFocused)) { lastFocused.focus({ preventScroll: true }); }
});
</script>

<template>
  <div class="viewer">
    <div class="viewer-backdrop" @click="emit('close')"></div>

    <section class="window window-viewer" role="dialog" aria-modal="true" :aria-label="file.name">
      <div class="titlebar">
        <FileIcon class="titlebar-icon titlebar-icon-file" :name="file.name" />
        <h2 class="titlebar-title">{{ file.name }}</h2>
        <div class="titlebar-controls">
          <button
            ref="closeBtn"
            class="titlebar-btn titlebar-btn-close"
            type="button"
            aria-label="Close file"
            @click="emit('close')">&times;</button>
        </div>
      </div>

      <!-- Keyed by name, so each file mounts its page afresh. -->
      <div class="viewer-body">
        <component :is="file.component" :key="file.name" :data="file.data" />
      </div>
    </section>
  </div>
</template>
