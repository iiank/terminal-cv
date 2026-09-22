/* Lets a text field in the JSON be one string or an array of strings, one line
   each. A nested array joins with spaces, so long sentences can span lines. */

export function toLines(value) {
  return [].concat(value)
    .map(function (entry) {
      return Array.isArray(entry) ? entry.map(function (part) { return part.trim(); }).join(' ') : entry;
    })
    .filter(Boolean);
}
