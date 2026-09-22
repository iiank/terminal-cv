<script setup>
/* Public change log. Edit last-updated.json whenever a page changes and the
   table follows on the next build. */

const props = defineProps({
  data: { type: Object, required: true }
});

const DAY = 86400000;

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/* Dates are written DD-MM-YYYY. A malformed or impossible date, such as
   31-02-2026, throws so the mistake surfaces during development. */
function parseDate(value) {
  const [day, month, year] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    throw new Error('last-updated.json: "' + value + '" is not a valid DD-MM-YYYY date.');
  }
  return date;
}

const rows = props.data.pages.map(function (page) {
  const date = parseDate(page.updated);
  const age = Math.floor((Date.now() - date.getTime()) / DAY);

  return {
    file: page.file,
    note: page.note,
    age,
    shown: dateFormat.format(date),
    stale: age > props.data.reviewAfterDays
  };
}).sort(function (a, b) { return b.age - a.age; });

const staleCount = rows.filter(function (row) { return row.stale; }).length;
const builtOn = new Date(__BUILD_TIME__).toLocaleString('en-GB');
</script>

<template>
  <div class="devlog">
    <p class="devlog__banner">
      When each page on this site was last updated, so you can tell how current the details are.
    </p>

    <dl class="devlog__summary">
      <div>
        <dt>Oldest page</dt>
        <dd>{{ rows[0].age }} days</dd>
      </div>
      <div>
        <dt>Needs review</dt>
        <dd>{{ staleCount }} of {{ rows.length }}</dd>
      </div>
      <div>
        <dt>Review after</dt>
        <dd>{{ props.data.reviewAfterDays }} days</dd>
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

    <p class="devlog__hint">Anything past {{ props.data.reviewAfterDays }} days is flagged for a rewrite.</p>
  </div>
</template>
