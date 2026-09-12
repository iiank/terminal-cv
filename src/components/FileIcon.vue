<script setup>
/* Maps a file name to an icon. Each icon is imported individually, so only
   the ones listed here end up in the bundle. Add a case when you add a page. */

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

const icons = {
  md: MarkdownIcon,
  json: JsonIcon,
  ipynb: NotebookIcon,
  txt: TextIcon,
  log: LogIcon
};

const icon = computed(function () {
  const extension = props.name.split('.').pop().toLowerCase();
  return icons[extension] || FileIcon;
});
</script>

<template>
  <component :is="icon" class="fileicon" aria-hidden="true" />
</template>