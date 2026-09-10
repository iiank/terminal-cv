<script setup>
import { computed } from 'vue';
import { useTheme } from '../composables/useTheme.js';

const { theme, toggleTheme } = useTheme();

const isLight = computed(function () { return theme.value === 'light'; });
</script>

<template>
  <button
    class="switch"
    type="button"
    role="switch"
    :aria-checked="isLight"
    :aria-label="isLight ? 'Switch to dark mode' : 'Switch to light mode'"
    @click="toggleTheme">
    <span class="switch__plate" :class="{ 'switch__plate--on': isLight }">
      <span class="switch__rocker"></span>
    </span>
  </button>
</template>
