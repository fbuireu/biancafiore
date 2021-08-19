export function capitalizy(text) {
  return text
    .toString()
    .replace(/-/g, ` `)
    .replace(/\b\w/g, word => word.toUpperCase());
}