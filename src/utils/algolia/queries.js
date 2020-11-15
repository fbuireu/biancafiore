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
            featuredImage {
              childImageSharp {
                fluid {
                  aspectRatio
                  src
                  srcSet
                  sizes
                  originalImg
                  originalName
                }
              }
            } 
          }
        }
      }
    }
  }
}`;

const projectsQuery = `{
  projects: allMarkdownRemark(
    filter: { frontmatter: { key: { eq: "project" }}}, 
    sort: { fields: frontmatter___publishDate, order: DESC }) {
    edges {
      node {
        html
        excerpt(pruneLength: 350)
        objectID: id
        frontmatter {
          language
          name
          publishDate
          tags
          featuredImage {
            childImageSharp {
              fluid {
                aspectRatio
                src
                srcSet
                sizes
                originalImg
                originalName
              }
            }
          }
        }
      }
    }
  }
}`;

const flatten = data => data.map(({ node: { frontmatter, ...rest } }) => ({ ...frontmatter, ...rest })),
  SETTINGS = { attributesToSnippet: [`excerpt: 200`] },
  algoliaQueries = [
    {
      query: articlesQuery,
      transformer: ({ data }) => flatten(data.articles.edges),
      indexName: process.env.GATSBY_ALGOLIA_ARTICLES_INDEX_NAME,
      SETTINGS,
      matchFields: [`fields.slug`, `content.title`,`content.lastUpdated`]
    },
    {
      query: projectsQuery,
      transformer: ({ data }) => flatten(data.projects.edges),
      indexName: process.env.GATSBY_ALGOLIA_PROJECTS_INDEX_NAME,
      SETTINGS,
      matchFields: [`name`]
    },
  ];

module.exports = algoliaQueries;