const PROJECTS_QUERY = `{
  projects: allMarkdownRemark(
    filter: { frontmatter: { 
      key: { eq: "project" }, 
      isDraft: { eq: false }
      }
    }, 
    sort: { frontmatter: { content: { publishDate: DESC }}}) {
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
                  gatsbyImageData(layout: FULL_WIDTH)
              }
            } 
          }
        }
      }
    }
  }
}`;

module.exports = PROJECTS_QUERY;
