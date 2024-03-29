const path = require(`path`);

const articlesBuilder = async (graphql, { createPage }, reporter) => {
  const articleTemplate = path.resolve(
    `./src/components/templates/Article/Article.js`
  );

  const articlesQuery = await graphql(`
    query getAllArticlesOrderedByDate {
      articles: allMarkdownRemark(
        filter: {
          isFuture: { eq: false }
          frontmatter: { key: { eq: "article" }, isDraft: { eq: false } }
        }
        sort: { frontmatter: { content: { publishDate: DESC }}}
      ) {
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
    let {
      fields: { slug },
      frontmatter: {
        author,
        content: { tags },
      },
    } = article;

    createPage({
      path: `/blog${slug}`,
      component: articleTemplate,
      context: {
        slug,
        author,
        tags,
      },
    });
  });
};

module.exports = articlesBuilder;
