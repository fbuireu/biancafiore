const path = require(`path`);
const slugify = require(`slugify`);

async function tagsBuilder(graphql, { createPage }, reporter) {
  const tagTemplate = path.resolve(
    `./src/components/templates/Tags/Tags.js`);

  const tagsQuery = await graphql(`
    query {
      articles: allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              key
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
  const articles = tagsQuery.data.articles.edges;

  articles.map(({ node }) => {
    let { content, language } = node.frontmatter;

    (content && content.tags) && content.tags.map(tag => tags.push(slugify(tag, { lower: true })));
    language && tags.push(slugify(language, { lower: true }));

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