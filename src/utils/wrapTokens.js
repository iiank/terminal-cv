/* Hard-wraps a token line at a given column, breaking on spaces and never
   splitting a styled chip in half. Because each wrapped row becomes its own
   line element, the gutter numbers stay in step with what is on screen. */

export function wrapTokens(tokens, width) {
  if (!tokens.length || width < 20) { return [tokens]; }

  /* Continuation rows line up under the text of a bullet or quote
     rather than under its marker. */
  const marker = tokens[0].c === 'md-mark' ? tokens[0].t.length : 0;
  const indent = ' '.repeat(marker);

  const rows = [];
  let row = [];
  let length = 0;

  function commit() {
    if (row.length) { rows.push(row); }
    row = [];
    length = 0;
  }

  tokens.forEach(function (token) {
    /* A chip is one unit. Splitting it on its inner space would render
       each word as a separate bordered box. */
    const parts = token.c === 'md-code'
      ? [String(token.t)]
      : String(token.t).split(/(\s+)/).filter(function (part) { return part !== ''; });

    parts.forEach(function (part) {
      if (length + part.length <= width) {
        row.push({ c: token.c, t: part });
        length += part.length;
        return;
      }

      /* A space landing on the break point is dropped, not carried down. */
      if (/^\s+$/.test(part)) { return; }

      commit();

      if (marker) {
        row.push({ t: indent });
        length = marker;
      }

      row.push({ c: token.c, t: part });
      length += part.length;
    });
  });

  commit();
  return rows.length ? rows : [tokens];
}