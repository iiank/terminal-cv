<script setup>
import data from '../../data/projects.json';

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
        <p class="cell__body">{{ project.body }}</p>
      </div>
    </div>
  </div>
</template>