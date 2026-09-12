<script setup>
/* Content lives in src/data/about-me.json. This component turns it into
   token lines so the markdown can be tinted without raw HTML. */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import data from '../../data/about-me.json';
import { toLines } from '../../utils/toLines.js';
import { wrapTokens } from '../../utils/wrapTokens.js';

/* A stack group is two lines: the label, then its chips indented beneath.
   The indent token is marked md-mark so wrapTokens treats it as a marker
   and keeps wrapped rows aligned under the first chip. */
function stackLines(label, items) {
  const chips = [{ c: 'md-mark', t: '    ' }];

  items.forEach(function (item, index) {
    if (index) { chips.push({ t: ' ' }); }
    chips.push({ c: 'md-code', t: item });
  });

  return [
    [{ c: 'md-mark', t: '- ' }, { t: label + ':' }],
    chips
  ];
}

function buildLines() {
  const out = [];

  data.sections.forEach(function (section, index) {
    if (index) { out.push([]); }

    out.push([{ c: 'md-hash', t: '# ' }, { c: 'md-head', t: section.heading }]);
    out.push([]);

    toLines(section.paragraphs).forEach(function (paragraph) {
      out.push([{ t: paragraph }]);
    });

    const quotes = toLines(section.quote);
    if (quotes.length) {
      out.push([]);
      quotes.forEach(function (quote) {
        out.push([{ c: 'md-mark', t: '> ' }, { c: 'md-quote', t: quote }]);
      });
    }

    if (section.stack) {
      out.push([]);
      section.stack.forEach(function (group) {
        stackLines(group.label, group.items).forEach(function (line) {
          out.push(line);
        });
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

const sourceLines = buildLines();

/* Hard-wrapping happens at the column that actually fits, so every row on
   screen is a real line with its own number. */
const codeEl = ref(null);
const columns = ref(70);
let observer = null;

function measure() {
  const el = codeEl.value;
  if (!el) { return; }

  const probe = document.createElement('span');
  probe.textContent = '0'.repeat(50);
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;';
  el.appendChild(probe);
  const charWidth = probe.getBoundingClientRect().width / 50;
  probe.remove();

  if (!charWidth) { return; }

  const sample = el.querySelector('.line');
  const gutter = sample ? parseFloat(getComputedStyle(sample).paddingLeft) : 62;
  const available = el.clientWidth - gutter - 16;

  columns.value = Math.max(20, Math.floor(available / charWidth));
}

const lines = computed(function () {
  return sourceLines.flatMap(function (line) { return wrapTokens(line, columns.value); });
});

onMounted(function () {
  measure();
  observer = new ResizeObserver(measure);
  observer.observe(codeEl.value);
});

onBeforeUnmount(function () {
  if (observer) { observer.disconnect(); }
});
</script>

<template>
  <div class="editor">
    <div class="editor__tabs">
      <span class="editor__tab editor__tab--active">about_me.md</span>
    </div>

    <div ref="codeEl" class="editor__code">
      <p v-for="(line, index) in lines" :key="index" class="line"><span v-for="(token, part) in line" :key="part" :class="token.c">{{ token.t }}</span></p>
    </div>

    <div class="editor__status">
      <span>Markdown</span>
      <span>UTF-8</span>
      <span>Ln {{ lines.length }}, Col 1</span>
    </div>
  </div>
</template>