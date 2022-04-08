export const PROJECTS_SEARCH_PARAMETERS = [
  {
    label: `Tags`,
    attribute: `content.tags`,
    operator: `and`,
    queryString: `tag`,
  },
  {
    label: `Language`,
    attribute: `language`,
    operator: `and`,
    queryString: `language`,
  }
];