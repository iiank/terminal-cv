<script setup>
/* Content lives in src/data/about-me.json. This component turns it into
   token lines so the markdown can be tinted without raw HTML. */

import data from '../../data/about-me.json';

/* Builds a bullet of chips with a single space between each one. */
function stackLine(label, items) {
  const tokens = [{ c: 'md-mark', t: '- ' }, { t: label + ': ' }];
  items.forEach(function (item, index) {
    if (index) { tokens.push({ t: ' ' }); }
    tokens.push({ c: 'md-code', t: item });
  });
  return tokens;
}

function buildLines() {
  const out = [];

  data.sections.forEach(function (section, index) {
    if (index) { out.push([]); }

    out.push([{ c: 'md-hash', t: '# ' }, { c: 'md-head', t: section.heading }]);
    out.push([]);

    (section.paragraphs || []).forEach(function (paragraph) {
      out.push([{ t: paragraph }]);
    });

    const quotes = [].concat(section.quote || []);
    if (quotes.length) {
      out.push([]);
      quotes.forEach(function (quote) {
        out.push([{ c: 'md-mark', t: '> ' }, { c: 'md-quote', t: quote }]);
      });
    }

    if (section.stack) {
      out.push([]);
      section.stack.forEach(function (group) {
        out.push(stackLine(group.label, group.items));
      });
    }
  });

  if (data.footer) {
    out.push([]);
    out.push([{ c: 'md-mark', t: '---' }]);
    out.push([
      { t: 'Last edited by ' },
      { c: 'md-code', t: data.footer.editedBy },
      { t: ', ' + data.footer.editedAgo + '.' }
    ]);
  }

  return out;
}

const lines = buildLines();
</script>

<template>
  <div class="editor">
    <div class="editor__tabs">
      <span class="editor__tab editor__tab--active">about_me.md</span>
    </div>

    <div class="editor__code">
      <p v-for="(line, index) in lines" :key="index" class="line"><span v-for="(token, part) in line" :key="part" :class="token.c">{{ token.t }}</span></p>
    </div>

    <div class="editor__status">
      <span>Markdown</span>
      <span>UTF-8</span>
      <span>Ln {{ lines.length }}, Col 1</span>
    </div>
  </div>
</template>