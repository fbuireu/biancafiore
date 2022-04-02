export function localizeDate({ date, locale, options = { dateStyle: `long` } }) {
  if (typeof date === `string`) {
    date = new Date(date);
  }
  return date.toLocaleString(locale, options);
}
