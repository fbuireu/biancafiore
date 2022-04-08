const path = require(`path`);
const slugify = require(`../utils/slugify/slugify`);

const tagsBuilder = async (graphql, { createPage }, reporter) => {
  const tagTemplate = path.resolve(`./src/components/templates/Tag/Tag.js`);

  const tagsQuery = await graphql(`
    query getAllTags {
      allTags: allMarkdownRemark (
        filter: { frontmatter: { key: { in: ["articleTag", "projectTag", "tag"] }}}) {
        edges {
          node {
            frontmatter {
              name
              slug
              type
              key
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

  let tags = { slugs: [], names: [], types: [], keys: [] };
  const { data: { allTags: { edges: allTags } } } = tagsQuery;

  // todo: can be a foreach without return? (avoid && return)
  allTags.map(({ node: tag }) => {
    let { name, slug, type, key } = tag.frontmatter;

    tags.slugs.push(slug ?? slugify(name));
    name && tags.names.push(name);
    type && tags.types.push(type);
    key && tags.keys.push(key);

    return new Set(tags.slugs) && new Set(tags.names) && new Set(tags.types) && new Set(tags.keys);
  });


  tags.slugs.forEach((tag, index) => {
    createPage({
      path: `tags/${tag}`,
      component: tagTemplate,
      context: {
        tag: {
          name: tags.names[index],
          type: tags.types[index],
          key: tags.keys[index]
        }
      }
    });
  });
};

module.exports = tagsBuilder;