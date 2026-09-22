/* Theme state. index.html applies the first theme before paint, so this reads
   it back rather than working it out a second time. */

import { ref } from 'vue';

/* Must match the key read by the inline script in index.html. */
const STORAGE_KEY = 'terminal-cv-theme';

const theme = ref(document.documentElement.dataset.theme);

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme.value;

    try {
      localStorage.setItem(STORAGE_KEY, theme.value);
    } catch (error) {
      /* Storage is blocked, so the choice lasts for this visit only. */
    }
  }

  return { theme, toggleTheme };
}
