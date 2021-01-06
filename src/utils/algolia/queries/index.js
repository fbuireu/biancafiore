import { ARTICLES_QUERY } from './articles';
import { PROJECTS_QUERY } from './projects';

const { GATSBY_ALGOLIA_ARTICLES_INDEX_NAME, GATSBY_ALGOLIA_PROJECTS_INDEX_NAME } = process.env;

const SETTINGS = { attributesToSnippet: [`excerpt: 200`] };

const flatten = data => data.map(({ node: { frontmatter, ...rest } }) => ({ ...frontmatter, ...rest }));

const ALGOLIA_QUERIES = [
  {
    query: ARTICLES_QUERY,
    transformer: ({ data }) => flatten(data.articles.edges),
    indexName: GATSBY_ALGOLIA_ARTICLES_INDEX_NAME,
    SETTINGS,
    matchFields: [`fields.slug`, `content.title`, `content.lastUpdated`]
  },
  {
    query: PROJECTS_QUERY,
    transformer: ({ data }) => flatten(data.projects.edges),
    indexName: GATSBY_ALGOLIA_PROJECTS_INDEX_NAME,
    SETTINGS,
    matchFields: [`content.name`, `content.publishDate`]
  },
  // {
  //   query: PROJECTS_AND_ARTICLES_QUERY,
  //   transformer: ({ data }) => flatten(data.projctsAndArticles.edges),
  //   indexName: process.env.GATSBY_ALGOLIA_PROJECTS_INDEX_NAME,
  //   SETTINGS,
  //   matchFields: [`fields.slug`, `content.title`,`content.lastUpdated`, `name`]
  // },
];

module.exports = ALGOLIA_QUERIES;