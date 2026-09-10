/* The files the terminal knows about. One component per page. */

import AboutMe from './components/pages/AboutMe.vue';
import Experiences from './components/pages/Experiences.vue';
import Projects from './components/pages/Projects.vue';
import Contact from './components/pages/Contact.vue';
import LastUpdated from './components/pages/LastUpdated.vue';

const registry = new Map();

/**
 * @param {string} name      file name shown in the terminal
 * @param {object} component Vue component rendered in the viewer
 * @param {object} options   listed: false hides it from dir and git status
 */
export function registerFile(name, component, options = {}) {
  registry.set(name, {
    name,
    component,
    listed: options.listed !== false
  });
}

export function getFile(name) {
  return registry.get(name) || null;
}

/** Public files, in registration order. */
export function listedFiles() {
  return [...registry.values()].filter((file) => file.listed).map((file) => file.name);
}

export function allFiles() {
  return [...registry.keys()];
}

registerFile('about_me.md', AboutMe);
registerFile('experiences.json', Experiences);
registerFile('projects.ipynb', Projects);
registerFile('contact.txt', Contact);
registerFile('last_updated.log', LastUpdated);
