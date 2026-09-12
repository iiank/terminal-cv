/* Lets any text field in the JSON be a single string or an array of
   strings. An array renders one line per entry, so content can break
   where it is written rather than only where the box happens to wrap. */

export function toLines(value) {
  if (value === undefined || value === null) { return []; }

  return [].concat(value)
    .map(function (entry) {
      if (Array.isArray(entry)) {
        return entry.map(function (part) { return String(part).trim(); }).join(' ');
      }
      return String(entry);
    })
    .filter(function (line) { return line.length > 0; });
}