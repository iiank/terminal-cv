/* Hard-wraps a token line at a column count, breaking on spaces. Each row
   becomes its own line element, so gutter numbers match what is on screen. */

export function wrapTokens(tokens, width) {
  /* Rows after the first indent under a leading `hang` token, such as a list
     marker or a JSON indent, rather than starting at the margin. */
  const hang = tokens.length && tokens[0].hang ? tokens[0].t.length : 0;

  const rows = [];
  let row = [];
  let length = 0;

  function commit() {
    if (row.length) { rows.push(row); }
    row = [];
    length = 0;
  }

  tokens.forEach(function (token) {
    /* A chip stays whole and counts two extra columns for its padding and
       border, so a row of chips never overflows its measured width. */
    const chip = token.c === 'chip';
    const parts = chip ? [token.t] : token.t.split(/(\s+)/).filter(Boolean);

    parts.forEach(function (part) {
      const size = chip ? part.length + 2 : part.length;

      if (length + size <= width) {
        row.push({ c: token.c, t: part });
        length += size;
        return;
      }

      /* A space landing on the break is dropped, not carried down. */
      if (/^\s+$/.test(part)) { return; }

      /* A word wider than the whole row overflows rather than leaving a
         numbered row that holds nothing but indentation. */
      if (!row.some(function (item) { return item.t.trim(); })) {
        row.push({ c: token.c, t: part });
        length += size;
        return;
      }

      commit();

      if (hang) {
        row.push({ t: ' '.repeat(hang) });
        length = hang;
      }

      row.push({ c: token.c, t: part });
      length += size;
    });
  });

  commit();
  return rows.length ? rows : [tokens];
}
