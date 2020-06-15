const articlesQuery = `{
  articles: allMarkdownRemark (
    filter: { frontmatter: { key: { eq: "article" }}},
    sort: { 
      fields: frontmatter___content___publishDate, 
      order: DESC }) {
    edges {
      node {
        html
        excerpt (pruneLength: 350)
        fields {
          slug
        }
        objectID: id
        frontmatter {
          language
          author
          content {
            title
            summary
            publishDate
            lastUpdated
            readingTime
            isFeaturedArticle 
            tags
          }
        }
      }
    }
  }
}`;

const flatten = data => data.map(({ node: { frontmatter, ...rest } }) => ({ ...frontmatter, ...rest })),
  settings = { attributesToSnippet: [`excerpt:20`] },
  algoliaQueries = [
    {
      query: articlesQuery,
      transformer: ({ data }) => flatten(data.articles.edges),
      indexName: `Articles`,
      settings,
    },
  ];

module.exports = algoliaQueries;