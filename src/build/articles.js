import * as path from 'path';

export async function home (graphql, { createPage }, reporter) {
  const ARTICLES_TEMPLATE = path.resolve(
    __dirname + `/../../pages/index.js`);

  const QUERY = await graphql(`{
      allMarkdownRemark {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              tags
              templateKey
            }
          }
        }
      }
    }
`);

  if (QUERY.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return true;
  }

  let resultForms = QUERY.data.allMarkdownRemark.edges;

  resultForms.map(node => {
    createPage({
      path: node.slug + `/`,
      component: ARTICLES_TEMPLATE,
      context: {},
    });
  });
}