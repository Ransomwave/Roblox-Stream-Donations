const numberFormat = new Intl.NumberFormat();

/** Formats a number with thousands separators for the viewer's locale (e.g. 1234567 → "1,234,567"). */
export function formatNumber(value) {
  return numberFormat.format(value);
}

/** Escapes a string so it can be safely inserted into HTML. */
export function sanitizeHTML(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

/** Resolves after the given number of milliseconds. */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
