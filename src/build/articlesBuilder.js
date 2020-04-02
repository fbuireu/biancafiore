const path = require(`path`);

async function articlesBuilder(graphql, { createPage }, reporter) {
  const articleTemplate = path.resolve(
    `./src/components/templates/Article/Article.js`);

  const articlesQuery = await graphql(`
    query getAllArticlesOrderedByDate {
      articles:allMarkdownRemark(
        filter: { frontmatter: { key: { eq: "blog" }}},
        sort: { order: DESC, fields: [frontmatter___content___publishDate] }) {
        edges {
          node {
            html
            fields {
              slug
            }
            frontmatter {
              key
              language
              seo {
                author
                metaDescription
              }
              content {
                publishDate
                lastUpdated
                readingTime
                isFeaturedPost
                featuredImage
                title
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

  articles.forEach(({ node }) => {
    createPage({
      path: `${node.frontmatter.key}${node.fields.slug}`,
      tags: node.frontmatter.content.tags,
      component: articleTemplate,
      context: {
        slug: node.fields.slug,
        seo: node.seo,
        content: node.content,
      },
    });
  });
}

module.exports = articlesBuilder;