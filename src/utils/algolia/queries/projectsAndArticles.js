export const PROJECTS_AND_ARTICLES_QUERY = `{
  projctsAndArticles: allMarkdownRemark(
    filter: { frontmatter: { key: { in: ["project", "article"]}}},
    sort: { fields: frontmatter___publishDate, order: DESC }) {
    edges {
      node {
        html
        excerpt(pruneLength: 350)
        objectID: id
        frontmatter {
          type: key
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
