export const TAGS_SEARCH_PARAMETERS = [
  {
    label: `Type`,
    attribute: `type`,
    operator: `and`
  },
  {
    label: `Language`,
    attribute: `language`,
    operator: `and`
  },
  {
    label: `Tags`,
    attribute: `content.tags`,
    operator: `and`
  },
  {
    label: `Authors`,
    attribute: `author`,
    operator: `or`
  }
];