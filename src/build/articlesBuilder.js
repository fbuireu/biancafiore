const path = require(`path`);

async function articlesBuilder(graphql, { createPage }, reporter) {
  const articleTemplate = path.resolve(
    `./src/components/templates/Article/Article.js`);

  const articlesQuery = await graphql(`
    query getAllArticlesOrderedByDate {
      articles: allMarkdownRemark (
        filter: { frontmatter: { key: { eq: "article" }}},
        sort: { 
          fields: frontmatter___content___publishDate, 
          order: DESC }) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
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
      path: `/blog${article.fields.slug}`,
      component: articleTemplate,
      context: {
        slug: article.fields.slug,
        author: article.frontmatter.author,
        tags: article.frontmatter.content.tags,
      },
    });
  });
}

module.exports = articlesBuilder;