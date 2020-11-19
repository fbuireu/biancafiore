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

  let tags = { slugs: [], names: [] };
  const allTags = tagsQuery.data.allTags.edges;

  allTags.map(({ node: tag }) => {
    let { name, slug } = tag.frontmatter;

    slug ? tags.slugs.push(slug) : tags.slugs.push(slugify(name, { lower: true }));
    name && tags.names.push(name);

    return new Set(tags.slugs) && new Set(tags.names);
  });

  tags.slugs.forEach((tag, index) => {
    let name = tags.names[index];

    createPage({
      path: `tag/${tag}`,
      component: tagTemplate,
      context: {
        name: name
      }
    });
  });
}

module.exports = tagsBuilder;