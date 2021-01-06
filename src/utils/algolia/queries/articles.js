const ARTICLES_QUERY = `{
  articles: allMarkdownRemark (
    filter: { frontmatter: { 
      key: { eq: "article" },  
      isDraft: { eq: false }
      }
    },
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
          type: key
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

module.exports = ARTICLES_QUERY;