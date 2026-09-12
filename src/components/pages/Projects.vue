<script setup>
import data from '../../data/projects.json';
import { toLines } from '../../utils/toLines.js';

const projects = data.projects;

/* GitHub's OpenGraph endpoint returns the same card shown when a repository
   link is shared, so the cell output looks like a rendered embed. */
function previewUrl(repo) {
  return 'https://opengraph.githubassets.com/1/' + repo;
}
</script>

<template>
  <div class="notebook">
    <div class="notebook__toolbar">
      <span>projects.ipynb</span>
      <span class="notebook__kernel">{{ data.kernel }}</span>
    </div>

    <template v-for="(project, index) in projects" :key="project.title">
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
          <a
            class="cell__repo"
            :href="'https://github.com/' + project.repo"
            target="_blank"
            rel="noopener noreferrer"
            v-text="'github.com/' + project.repo"
          ></a>

          <a
            class="cell__preview"
            :href="'https://github.com/' + project.repo"
            target="_blank"
            rel="noopener noreferrer"
            tabindex="-1"
            aria-hidden="true"
          ><img
            :src="previewUrl(project.repo)"
            :alt="'Repository card for ' + project.repo"
            loading="lazy"
          ></a>
        </div>
      </div>
    </template>
  </div>
</template>