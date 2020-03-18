const path = require(`path`);

async function homeBuilder (graphql, { createPage }, reporter) {
  const HOME_PAGE = path.resolve(`./src/pages/index.js`);

  const QUERY = await graphql(`
    {
      allMarkdownRemark(filter: { frontmatter: {slug: {eq: "/" }}}) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
              description
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
  
  let homeData = QUERY.data.allMarkdownRemark.edges;

  homeData.forEach(({ node }) => {
    createPage({
      path: node.fields.slug,
      component: HOME_PAGE,
      context: {},
    });
  });
}

module.exports = homeBuilder;