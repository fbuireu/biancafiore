const path = require(`path`);

async function articlesBuilder(graphql, { createPage }, reporter) {
  const articleTemplate = path.resolve(
    `./src/components/templates/Article/Article.js`);

  const articlesQuery = await graphql(`
    query getAllArticlesOrderedByDate {
      articles: allMarkdownRemark(
        filter: { frontmatter: { key: { eq: "blog" }}},
        sort: { order: ASC, fields: frontmatter___content___publishDate }){
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

  let articles = articlesQuery.data.articles.edges,
    allTags = articles.map(({ node: article }) => article.frontmatter.content.tags);
  // relatedArticlesarticles = articles.node.find(article=>{
  // });

  let arr1 = {
    content: {
      tags: [`How to guides`],
    },
  };
  let arr2 = [`How to guides`, `Writing tips`];

  // let relatedArticlesarticles = arr1.content.tags.find(ai => {
  //   if (arr2.includes(ai)) {
  //     return ai;
  //   }
  // });

  let relatedArticlesarticles = articles.map(({ node: article }) => {
    // console.log(article.frontmatter.content.tags);
    if (article.frontmatter.content.tags.find(tag => allTags.includes(tag))) {
      console.log(article);
    }
  });

  articles.forEach(({ node: article }) => {
    createPage({
      path: `${article.frontmatter.key}${article.fields.slug}`,
      component: articleTemplate,
      context: {
        slug: article.fields.slug,
        author: article.frontmatter.author,
      },
    });
  });
}

module.exports = articlesBuilder;