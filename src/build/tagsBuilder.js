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
              language
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

    return;
  }

  let tags = [];
  const articles = tagsQuery.data.articles.edges;

  articles.map(({ node }) => {
    let { content, language } = node.frontmatter;

    (content && content.tag) && content.tags.map(tag => tags.push(slugify(tag, { lower: true })));
    language && tags.push(slugify(language, { lower: true }));

    return Array.from(new Set(tags));
  });

  tags.forEach(tag => {
    createPage({
      path: `tag/${tag}`,
      component: tagsTemplate,
      context: {},
    });
  });
}

module.exports = tagsBuilder;