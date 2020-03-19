const path = require(`path`);

async function articlesBuilder (graphql, { createPage }, reporter) {
  const articlesTemplate = path.resolve(
    `./src/components/templates/articles.js`);

  const articlesQuery = await graphql(`
    {
      allMarkdownRemark(
        filter: { frontmatter: { templateKey: { eq: "articles" }}}, 
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

  if (articlesQuery.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);

    return true;
  }

  let articles = articlesQuery.data.allMarkdownRemark.edges;

  articles.forEach(({ node }) => {
    createPage({
      path: `${node.frontmatter.templateKey}${node.fields.slug}`,
      tags: node.frontmatter.content.tags,
      component: articlesTemplate,
      context: {},
    });
  });
}

module.exports = articlesBuilder;