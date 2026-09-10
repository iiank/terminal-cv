/* Shared light switch state. Stores the choice, falls back to the OS. */

import { ref, watchEffect } from 'vue';

const STORAGE_KEY = 'terminal-cv-theme';

function readInitial() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') { return stored; }
  } catch (error) {
    /* Private browsing blocks storage. Fall through to the OS setting. */
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

const theme = ref(readInitial());

watchEffect(() => {
  document.documentElement.dataset.theme = theme.value;
});

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem(STORAGE_KEY, theme.value);
    } catch (error) {
      /* Storage unavailable. The theme still applies for this visit. */
    }
  }

  return { theme, toggleTheme };
}
