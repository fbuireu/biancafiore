const path = require(`path`);

async function tagsBuilder (graphql, { createPage }, reporter) {
  const tagsTemplate = path.resolve(
    `./src/components/templates/tags.js`);

  const tagsQuery = await graphql(`
    {
      allMarkdownRemark{
        edges {
          node {
            frontmatter {
              key
              locale
              content {
                tags
              }
            }
          }
        }
      }
    }
  `);

  if (tagsQuery.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);

    return true;
  }

  const tags = tagsQuery.data.allMarkdownRemark.edges;

  tags.forEach(({ node }) => {
    createPage({
      path: `${node.frontmatter.key}${node.fields.slug}`,
      component: tagsTemplate,
      context: {},
    });
  });
}

module.exports = tagsBuilder;