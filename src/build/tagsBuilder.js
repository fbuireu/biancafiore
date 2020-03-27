const path = require(`path`);
const slugify = require(`slugify`);

async function tagsBuilder(graphql, { createPage }, reporter) {
  const tagsTemplate = path.resolve(
    `./src/components/templates/Tags/Tags.js`);

  const tagsQuery = await graphql(`
    {
      articles:allMarkdownRemark{
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
  const articles = tagsQuery.data.articles.edges;

  articles.map(({ node }) => {
    let { content, locale } = node.frontmatter;

    (content && content.tag) &&
    content.tags.map(tag => tags.push(slugify(tag, { lower: true })));
    locale && tags.push(slugify(locale, { lower: true }));

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