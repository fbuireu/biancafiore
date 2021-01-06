export const ARTICLES_SEARCH_PARAMETERS = [
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