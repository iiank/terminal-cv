<script setup>
/* Public change log. Edit src/data/last-updated.json whenever a page
   changes and the table here updates on the next build. */

import { computed } from 'vue';
import data from '../../data/last-updated.json';

const buildTime = typeof __BUILD_TIME__ === 'undefined' ? '' : __BUILD_TIME__;

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric'
});

/* Dates in last-updated.json are written DD-MM-YYYY. Returns null rather
   than an Invalid Date, so one bad entry cannot break the whole table. */
function parseDate(value) {
  const parts = String(value).split('-');
  if (parts.length !== 3) { return null; }

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);

  const parsed = new Date(year, month - 1, day);

  /* Rejects impossible days such as 31-02-2026, which would otherwise
     silently roll over into the following month. */
  const valid = parsed.getDate() === day
    && parsed.getMonth() === month - 1
    && parsed.getFullYear() === year;

  return valid ? parsed : null;
}

const rows = computed(function () {
  return data.pages.map(function (page) {
    const date = parseDate(page.updated);
    const age = date ? Math.floor((Date.now() - date.getTime()) / 86400000) : 0;

    return {
      file: page.file,
      note: page.note,
      age,
      shown: date ? dateFormat.format(date) : 'unknown',
      stale: date ? age > data.reviewAfterDays : false
    };
  }).sort(function (a, b) { return b.age - a.age; });
});

const oldest = computed(function () { return rows.value.length ? rows.value[0].age : 0; });
const staleCount = computed(function () { return rows.value.filter(function (row) { return row.stale; }).length; });

const builtOn = computed(function () {
  if (!buildTime) { return 'not built yet'; }
  return new Date(buildTime).toLocaleString('en-GB');
});
</script>

<template>
  <div class="devlog">
    <p class="devlog__banner">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit
      sed do eiusmod tempor incididunt.
    </p>

    <dl class="devlog__summary">
      <div>
        <dt>Oldest page</dt>
        <dd>{{ oldest }} days</dd>
      </div>
      <div>
        <dt>Needs review</dt>
        <dd>{{ staleCount }} of {{ rows.length }}</dd>
      </div>
      <div>
        <dt>Review after</dt>
        <dd>{{ data.reviewAfterDays }} days</dd>
      </div>
      <div>
        <dt>Site deployed</dt>
        <dd>{{ builtOn }}</dd>
      </div>
    </dl>

    <table class="devlog__table">
      <thead>
        <tr>
          <th scope="col">File</th>
          <th scope="col">Updated</th>
          <th scope="col">Age</th>
          <th scope="col">Note</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.file" :class="{ 'is-stale': row.stale }">
          <td>{{ row.file }}</td>
          <td>{{ row.shown }}</td>
          <td>{{ row.age }}d<span v-if="row.stale" class="devlog__flag">review</span></td>
          <td>{{ row.note }}</td>
        </tr>
      </tbody>
    </table>

    <p class="devlog__hint">Anything past {{ data.reviewAfterDays }} days is flagged for a rewrite.</p>
  </div>
</template>
