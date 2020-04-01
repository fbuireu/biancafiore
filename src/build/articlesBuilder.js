const path = require(`path`);

async function articlesBuilder(graphql, { createPage }, reporter) {
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
              language
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

    return;
  }

  let articles = articlesQuery.data.articles.edges;

  articles.forEach(({ node }) => {
    createPage({
      path: `${node.frontmatter.key}${node.fields.slug}`,
      tags: node.frontmatter.content.tags,
      component: articlesTemplate,
      context: {
        slug: node.fields.slug,
        seo: node.seo,
        content: node.content,
      },
    });
  });
}

module.exports = articlesBuilder;