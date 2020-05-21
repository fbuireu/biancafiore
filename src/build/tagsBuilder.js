const path = require(`path`);
const slugify = require(`slugify`);

async function tagsBuilder(graphql, { createPage }, reporter) {
  const tagTemplate = path.resolve(
    `./src/components/templates/Tags/Tags.js`);

  const tagsQuery = await graphql(`
    query getAllTags{
      articles: allMarkdownRemark {
        edges {
          node {
            frontmatter {
              key
              name
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

  articles.map(({ node: article }) => {
    let { key, content, language, name: author } = article.frontmatter;

    (content && content.tags && content.tags.slug) && content.tags.map(({ slug }) => tags.push(slug));
    language && tags.push(slugify(language, { lower: true }));
    key === `author` && tags.push(slugify(author, { lower: true }));

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