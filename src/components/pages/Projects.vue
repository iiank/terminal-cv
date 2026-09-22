<script setup>
import { reactive } from 'vue';
import RunAllIcon from '~icons/mdi/fast-forward';
import RestartIcon from '~icons/mdi/restart';
import ClearOutputsIcon from '~icons/mdi/notification-clear-all';
import { toLines } from '../../utils/toLines.js';

const props = defineProps({
  data: { type: Object, required: true }
});

/* Decorative Jupyter toolbar with no behaviour. '|' draws a divider; the '...'
   after it stands for actions a narrow window has no room to show. */
const ACTIONS = [
  { label: '+ Code' },
  { label: '+ Markdown' },
  { label: '|' },
  { label: 'Run All', icon: RunAllIcon },
  { label: 'Restart', icon: RestartIcon },
  { label: 'Clear All Outputs', icon: ClearOutputsIcon },
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
    <div class="notebook__toolbar" aria-hidden="true">
      <div class="notebook__actions">
        <template v-for="(action, index) in ACTIONS" :key="index">
          <span v-if="action.label === '|'" class="notebook__divider"></span>
          <span v-else class="notebook__action">
            <component :is="action.icon" v-if="action.icon" class="notebook__icon" />{{ action.label }}
          </span>
        </template>
      </div>
      <span class="notebook__action">...</span>
      <span class="notebook__kernel">{{ props.data.kernel }}</span>
    </div>

    <template v-for="(project, index) in props.data.projects" :key="project.title">
      <div class="cell">
        <div class="cell__marker">[{{ index + 1 }}]</div>
        <div class="cell__box">
          <p class="cell__title">{{ project.title }}</p>
          <p v-for="(paragraph, part) in toLines(project.body)" :key="part" class="cell__body">{{ paragraph }}</p>
        </div>
      </div>

      <div v-if="project.repo" class="cell cell--output">
        <div class="cell__marker cell__marker--out">Out[{{ index + 1 }}]</div>
        <div class="cell__result">
          <a class="cell__repo" :href="repoUrl(project.repo)" target="_blank" rel="noopener noreferrer">github.com/{{ project.repo }}</a>

          <a
            v-if="!missingPreview.has(project.repo)"
            class="cell__preview"
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
