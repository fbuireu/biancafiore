const path = require(`path`);

async function homeBuilder (graphql, { createPage }, reporter) {
  const homePage = path.resolve(`./src/pages/index.js`);

  const homeQuery = await graphql(`
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

  if (homeQuery.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);

    return true;
  }
  
  const homeData = homeQuery.data.allMarkdownRemark.edges;

  homeData.forEach(({ node }) => {
    createPage({
      path: node.fields.slug,
      component: homePage,
      context: {},
    });
  });
}

module.exports = homeBuilder;