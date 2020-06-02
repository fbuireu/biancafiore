const path = require(`path`);
const slugify = require(`slugify`);

async function tagsBuilder(graphql, { createPage }, reporter) {
  const tagTemplate = path.resolve(
    `./src/components/templates/Tags/Tags.js`);

  const tagsQuery = await graphql(`
    query getAllTags {
      allTags: allMarkdownRemark (
        filter: { frontmatter: { key: { eq: "tag" }}}) {
        edges {
          node {
            frontmatter {
              name
              slug
              language
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

    return;
  }

  let tags = [];
  const allTags = tagsQuery.data.allTags.edges;

  allTags.map(({ node: tag }) => {
    let { name, slug } = tag.frontmatter;

    slug ? tags.push(slug) : tags.push(slugify(name, { lower: true }));

    return new Set(tags);
  });

  tags.forEach(tag => {
    createPage({
      path: `tag/${tag}`,
      component: tagTemplate,
      context: {},
    });
  });
}

module.exports = tagsBuilder;