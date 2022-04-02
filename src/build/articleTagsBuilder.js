const path = require(`path`);
const slugify = require(`../utils/slugify/slugify`);

const articleTagsBuilder = async (graphql, { createPage }, reporter) => {
  const tagTemplate = path.resolve(`./src/components/templates/Tag/Tag.js`);

  const tagsQuery = await graphql(`
    query getAllArticleTags {
      allArticleTags: allMarkdownRemark (
        filter: { frontmatter: { key: { in: ["articleTag", "tag"] }}}) {
        edges {
          node {
            frontmatter {
              name
              slug
              type
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

  let tags = { slugs: [], names: [], types: [] };
  const { data: { allArticleTags: { edges: allArticleTags } } } = tagsQuery;

  // todo: can be a foreach without return? (avoid && return)
  allArticleTags.map(({ node: tag }) => {
    let { name, slug, type } = tag.frontmatter;

    tags.slugs.push(slug ?? slugify(name));
    name && tags.names.push(name);
    type && tags.types.push(type);

    return new Set(tags.slugs) && new Set(tags.names) && new Set(tags.types);
  });


  tags.slugs.forEach((tag, index) => {
    createPage({
      path: `tags/${tag}`,
      component: tagTemplate,
      context: {
        tag: {
          name: tags.names[index],
          type: tags.types[index]
        }
      }
    });
  });
};

module.exports = articleTagsBuilder;