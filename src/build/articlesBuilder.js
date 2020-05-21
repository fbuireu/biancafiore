const path = require(`path`);

async function articlesBuilder(graphql, { createPage }, reporter) {
  const articleTemplate = path.resolve(
    `./src/components/templates/Article/Article.js`);

  const articlesQuery = await graphql(`
    query getAllArticlesOrderedByDate {
      articles: allMarkdownRemark(filter: { frontmatter: { key: { eq: "blog" }}}){
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              key
              author
              content {
                tags
              }
            }
          }
        }
      }
    }
  `);

  if (articlesQuery.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);

    return;
  }

  let articles = articlesQuery.data.articles.edges;

  articles.forEach(({ node: article }) => {
    createPage({
      path: `${article.frontmatter.key}${article.fields.slug}`,
      tags: article.frontmatter.content.tags,
      component: articleTemplate,
      context: {
        slug: article.fields.slug,
        author: article.frontmatter.author,
      },
    });
  });
}

module.exports = articlesBuilder;