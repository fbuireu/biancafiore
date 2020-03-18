const path = require(`path`);

async function articlesBuilder (graphql, { createPage }, reporter) {
  const ARTICLES_TEMPLATE = path.resolve(
    `./src/components/templates/articles.js`);

  const QUERY = await graphql(`
    {
      allMarkdownRemark(
        filter: { frontmatter: { templateKey: { eq: "article" }}}, 
        sort: { order: DESC, fields: [frontmatter___content___publishDate] }) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              templateKey
              locale
              seo {
                author
                title
                metaDescription
              }
              content {
                publishDate
                readingTime
                title
                tags
                body
              }
            }
          }
        }
      }
    }
  `);

  if (QUERY.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return true;
  }

  let articles = QUERY.data.allMarkdownRemark.edges;

  articles.forEach(({ article }) => {
    createPage({
      path: article.fields.slug,
      component: ARTICLES_TEMPLATE,
      tags: article.node.frontmatter.tags,
      context: {},
    });
  });
}

module.exports = articlesBuilder;