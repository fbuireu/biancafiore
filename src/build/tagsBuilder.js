const path = require(`path`);
const slugify = require(`slugify`);

async function tagsBuilder (graphql, { createPage }, reporter) {
  const tagsTemplate = path.resolve(
    `./src/components/templates/tags/tags.js`);

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
                body
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

  let tags = [];
  const posts = tagsQuery.data.allMarkdownRemark.edges;

  posts.map(({ node }) => {
    let { content, locale } = node.frontmatter;

    if (content && content.tags) content.tags.map(tag => tags.push(slugify(tag, { lower: true })));
    if (locale) tags.push(slugify(locale, { lower: true }));

    return Array.from(new Set(tags));
  });

  tags.forEach(tag => {
    createPage({
      path: `tag/${tag}/`,
      component: tagsTemplate,
      context: {},
    });
  });
}

module.exports = tagsBuilder;