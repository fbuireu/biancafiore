const PROJECTS_QUERY = `{
  projects: allMarkdownRemark(
    filter: { frontmatter: { 
      key: { eq: "project" }, 
      isDraft: { eq: false }
      }
    }, 
    sort: { fields: frontmatter___content___publishDate, order: DESC }) {
    edges {
      node {
        html
        excerpt(pruneLength: 350)
        objectID: id
        frontmatter {
          type: key
          language
          content {
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
  }
}`;

module.exports = PROJECTS_QUERY;