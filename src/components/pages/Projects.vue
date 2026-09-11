<script setup>
import data from '../../data/projects.json';
import { toLines } from '../../utils/toLines.js';

const projects = data.projects;
</script>

<template>
  <div class="notebook">
    <div class="notebook__toolbar">
      <span>projects.ipynb</span>
      <span class="notebook__kernel">{{ data.kernel }}</span>
    </div>

    <div v-for="(project, index) in projects" :key="project.title" class="cell">
      <div class="cell__marker">[{{ index + 1 }}]</div>
      <div class="cell__box">
        <p class="cell__title">{{ project.title }}</p>
        <p v-for="(paragraph, part) in toLines(project.body)" :key="part" class="cell__body">{{ paragraph }}</p>
      </div>
    </div>
  </div>
</template>