export const TAGS_SEARCH_PARAMETERS = [
  {
    label: `Language`,
    attribute: `language`,
    operator: `and`,
    queryString: `language`,
  },
  {
    label: `Tags`,
    attribute: `content.tags`,
    operator: `and`,
    queryString: `tag`,
  },
  {
    label: `Authors`,
    attribute: `author`,
    operator: `or`,
    queryString: `author`,
  },
];
