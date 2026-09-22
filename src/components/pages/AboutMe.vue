<script setup>
/* Renders about-me.json as markdown source in an editor window. Lines are
   wrapped at the column that fits, so every row keeps its own line number. */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { toLines } from '../../utils/toLines.js';
import { wrapTokens } from '../../utils/wrapTokens.js';

const props = defineProps({
  data: { type: Object, required: true }
});

/* A stack group is its label, then its chips indented on the line beneath. */
function stackLines(label, items) {
  const chips = [{ c: 'dim', t: '    ', hang: true }];

  items.forEach(function (item, index) {
    if (index) { chips.push({ t: ' ' }); }
    chips.push({ c: 'chip', t: item });
  });

  return [[{ c: 'dim', t: '- ', hang: true }, { t: label + ':' }], chips];
}

/* Markers carry `hang`, so wrapped rows line up under the text rather than
   under the marker. */
function buildLines(data) {
  const out = [];

  data.sections.forEach(function (section, index) {
    if (index) { out.push([]); }

    out.push([{ c: 'dim', t: '# ' }, { c: 'bright bold', t: section.heading }]);
    out.push([]);

    toLines(section.paragraphs).forEach(function (paragraph) {
      out.push([{ t: paragraph }]);
    });

    const quotes = toLines(section.quote);
    if (quotes.length) {
      out.push([]);
      quotes.forEach(function (quote) {
        out.push([{ c: 'dim', t: '> ', hang: true }, { c: 'soft italic', t: quote }]);
      });
    }

    if (section.stack) {
      out.push([]);
      section.stack.forEach(function (group) {
        out.push(...stackLines(group.label, group.items));
      });
    }
  });

  if (data.footer) {
    out.push([], [{ c: 'dim', t: '---' }]);
    out.push([
      { t: 'Last edited by ' },
      { c: 'chip', t: data.footer.editedBy },
      { t: ', ' + data.footer.editedAgo + '.' }
    ]);
  }

  return out;
}

const lines = buildLines(props.data);

const code = ref(null);
const columns = ref(80);
const observer = new ResizeObserver(measure);
let lastWidth = 0;

/* Height-only changes and sub-pixel jitter are ignored, so a re-wrap that
   brings in a scrollbar cannot keep triggering itself. */
function measure() {
  const el = code.value;
  if (Math.abs(el.clientWidth - lastWidth) < 2) { return; }
  lastWidth = el.clientWidth;

  const probe = document.createElement('span');
  probe.textContent = '0'.repeat(50);
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;';
  el.appendChild(probe);
  const charWidth = probe.getBoundingClientRect().width / 50;
  probe.remove();

  const line = el.querySelector('.line');
  const available = line.clientWidth - parseFloat(getComputedStyle(line).paddingLeft);
  columns.value = Math.max(20, Math.floor((available - 1) / charWidth));
}

const rows = computed(function () {
  return lines.flatMap(function (line) { return wrapTokens(line, columns.value); });
});

onMounted(function () { observer.observe(code.value); });
onBeforeUnmount(function () { observer.disconnect(); });
</script>

<template>
  <div class="editor">
    <div class="editor__tabs">
      <span class="editor__tab">about_me.md</span>
    </div>

    <div ref="code" class="editor__code">
      <p v-for="(row, index) in rows" :key="index" class="line"><span v-for="(token, part) in row" :key="part" :class="token.c">{{ token.t }}</span></p>
    </div>

    <div class="editor__status">
      <span>Markdown</span>
      <span>UTF-8</span>
      <span>Ln {{ rows.length }}, Col 1</span>
    </div>
  </div>
</template>
