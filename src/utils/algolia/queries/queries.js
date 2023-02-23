const ARTICLES_QUERY = require(`./articles`);
const PROJECTS_QUERY = require(`./projects`);

const {
  GATSBY_ALGOLIA_ARTICLES_INDEX_NAME,
  GATSBY_ALGOLIA_PROJECTS_INDEX_NAME,
} = process.env;

const SETTINGS = { attributesToSnippet: [`excerpt: 200`] };

const ALGOLIA_QUERIES = [
  {
    query: ARTICLES_QUERY,
    transformer: ({data}) =>
      data.articles.edges.flatMap(({node: {frontmatter, ...rest}}) => ({
        ...frontmatter,
        ...rest,
      })),
    indexName: GATSBY_ALGOLIA_ARTICLES_INDEX_NAME,
    SETTINGS,
    matchFields: [`objectID`],
  },
  {
    query: PROJECTS_QUERY,
    transformer: ({data}) =>
      data.projects.edges.flatMap(({node: {frontmatter, ...rest}}) => ({
        ...frontmatter,
        ...rest,
      })),
    indexName: GATSBY_ALGOLIA_PROJECTS_INDEX_NAME,
    SETTINGS,
    matchFields: [`objectID`],
  },
];

module.exports = ALGOLIA_QUERIES;
