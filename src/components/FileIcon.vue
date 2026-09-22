<script setup>
/* Maps a file extension to an icon. Icons are imported one by one, so only
   these reach the bundle; add a case when you add a new file type. */

import { computed } from 'vue';
import MarkdownIcon from '~icons/mdi/language-markdown';
import JsonIcon from '~icons/mdi/code-json';
import NotebookIcon from '~icons/mdi/notebook-outline';
import TextIcon from '~icons/mdi/file-document-outline';
import LogIcon from '~icons/mdi/file-clock-outline';
import FileIcon from '~icons/mdi/file-outline';

const props = defineProps({
  name: { type: String, required: true }
});

const ICONS = {
  md: MarkdownIcon,
  json: JsonIcon,
  ipynb: NotebookIcon,
  txt: TextIcon,
  log: LogIcon
};

const icon = computed(function () {
  return ICONS[props.name.split('.').pop().toLowerCase()] || FileIcon;
});
</script>

<template>
  <component :is="icon" aria-hidden="true" />
</template>
