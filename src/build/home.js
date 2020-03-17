const path = require(`path`);

async function home (graphql, { createPage }, reporter) {
  const HOME_PAGE = path.resolve(`./src/pages/index.js`);

  const QUERY = await graphql(`
  {
    allMarkdownRemark(filter: { frontmatter: {slug: {eq: '/' }}}) {
      edges {
        node {
          frontmatter {
            title
            slug
            description
            tag
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

  let result = QUERY.data.allMarkdownRemark.edges;

  result.forEach(node => {
    createPage({
      path: node.frontmatter.slug,
      component: HOME_PAGE,
      context: {
        data: node.frontmatter,
      },
    });
  });
}

module.exports = home;