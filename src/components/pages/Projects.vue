<script setup>
import { reactive } from 'vue';
import SaveIcon from '~icons/mdi/content-save-outline';
import AddIcon from '~icons/mdi/plus';
import CutIcon from '~icons/mdi/content-cut';
import CopyIcon from '~icons/mdi/content-copy';
import RunIcon from '~icons/mdi/play-outline';
import StopIcon from '~icons/mdi/square-outline';
import RestartIcon from '~icons/mdi/restart';
import { toLines } from '../../utils/toLines.js';

const props = defineProps({
  data: { type: Object, required: true }
});

/* Decorative Jupyter toolbar with no behaviour. '|' draws a divider; the '...'
   after it stands for actions a narrow window has no room to show. */
const ACTIONS = [
  { icon: SaveIcon },
  { label: '|' },
  { icon: AddIcon },
  { icon: CutIcon },
  { icon: CopyIcon },
  { label: '|' },
  { icon: RunIcon, label: 'Run' },
  { icon: StopIcon },
  { icon: RestartIcon },
  { label: '|' }
];

/* Repositories whose GitHub card failed to load. The text link stays, so a
   renamed or private repository never shows a broken image. */
const missingPreview = reactive(new Set());

function repoUrl(repo) {
  return 'https://github.com/' + repo;
}

/* GitHub's OpenGraph endpoint returns the card shown when a repository link
   is shared, so the cell output looks like a rendered embed. */
function previewUrl(repo) {
  return 'https://opengraph.githubassets.com/1/' + repo;
}
</script>

<template>
  <div class="notebook">
    <div class="notebook-toolbar" aria-hidden="true">
      <div class="notebook-actions">
        <template v-for="(action, index) in ACTIONS" :key="index">
          <span v-if="action.label === '|'" class="notebook-divider"></span>
          <span v-else class="notebook-action">
            <component :is="action.icon" class="notebook-icon" />{{ action.label }}
          </span>
        </template>
      </div>
      <span class="notebook-action">...</span>
      <span class="notebook-kernel">{{ props.data.kernel }}</span>
    </div>

    <template v-for="(project, index) in props.data.projects" :key="project.title">
      <div class="cell">
        <div class="cell-marker">[{{ index + 1 }}]</div>
        <div class="cell-box">
          <p class="cell-title">{{ project.title }}</p>
          <p v-for="(paragraph, part) in toLines(project.body)" :key="part" class="cell-body">{{ paragraph }}</p>
        </div>
      </div>

      <div v-if="project.repo" class="cell cell-output">
        <div class="cell-marker cell-marker-out">Out[{{ index + 1 }}]</div>
        <div class="cell-result">
          <a class="cell-repo" :href="repoUrl(project.repo)" target="_blank" rel="noopener noreferrer">github.com/{{ project.repo }}</a>

          <a
            v-if="!missingPreview.has(project.repo)"
            class="cell-preview"
            :href="repoUrl(project.repo)"
            target="_blank"
            rel="noopener noreferrer"
            tabindex="-1"
            aria-hidden="true"><img
              :src="previewUrl(project.repo)"
              alt=""
              loading="lazy"
              decoding="async"
              @error="missingPreview.add(project.repo)"></a>
        </div>
      </div>
    </template>
  </div>
</template>
