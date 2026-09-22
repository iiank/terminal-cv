/* Every file the terminal can open, in listing order. Each pairs a page with
   the data it renders; git pull also counts that data's lines as insertions. */

import AboutMe from './components/pages/AboutMe.vue';
import Experiences from './components/pages/Experiences.vue';
import Projects from './components/pages/Projects.vue';
import Contact from './components/pages/Contact.vue';
import LastUpdated from './components/pages/LastUpdated.vue';

import aboutMe from './data/about-me.json';
import experiences from './data/experiences.json';
import projects from './data/projects.json';
import contact from './data/contact.json';
import lastUpdated from './data/last-updated.json';

const FILES = [
  { name: 'about_me.md', component: AboutMe, data: aboutMe },
  { name: 'experiences.json', component: Experiences, data: experiences },
  { name: 'projects.ipynb', component: Projects, data: projects },
  { name: 'contact.txt', component: Contact, data: contact },
  { name: 'last_updated.log', component: LastUpdated, data: lastUpdated }
];

export function getFile(name) {
  return FILES.find(function (file) { return file.name === name; });
}

export function fileNames() {
  return FILES.map(function (file) { return file.name; });
}
