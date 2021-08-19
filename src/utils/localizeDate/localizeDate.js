import moment from 'moment/moment';

export function localizeDate(date, locale, format = `LL`) {
  return moment(new Date(date))
    .locale(locale)
    .format(format);
}
