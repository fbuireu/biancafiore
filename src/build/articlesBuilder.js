const path = require(`path`);

async function articlesBuilder(graphql, {createPage}, reporter) {
  const articlesTemplate = path.resolve(
    `./src/components/templates/Articles/Articles.js`);

  const articlesQuery = await graphql(`
    {
      articles:allMarkdownRemark(
        filter: { frontmatter: { key: { eq: "blog" }}},
        sort: { order: DESC, fields: [frontmatter___content___publishDate] }) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              key
              locale
              iso
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

  let articles = articlesQuery.data.articles.edges;

  articles.forEach(({node}) => {
    createPage({
      path: `${node.frontmatter.key}${node.fields.slug}`,
      tags: node.frontmatter.content.tags,
      component: articlesTemplate,
      context: {},
    });
  });
}

module.exports = articlesBuilder;