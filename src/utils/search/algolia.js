const articlesQuery = `{
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
}`,
  tagsQuery = `{
        tags: allMarkdownRemark (
        filter: { frontmatter: { key: { eq: "tag" }}}) {
        edges {
          node {
            frontmatter {
              name
              slug
              content {
                tags
              }
            }
          }
        }
      }
    }
  }`;

const flatten = arr => arr.map(({ node: { frontmatter, ...articleBody } }) => ({ ...frontmatter, ...articleBody })),
  settings = { attributesToSnippet: [`excerpt:20`] },
  algoliaQueries = [
    {
      query: articlesQuery,
      transformer: ({ data }) => flatten(data.articles.edges),
      indexName: `Articles`,
      settings,
    },
    {
      query: tagsQuery,
      transformer: ({ data }) => flatten(data.tags.edges),
      indexName: `tags`,
      settings,
    },
  ];

module.exports = algoliaQueries;