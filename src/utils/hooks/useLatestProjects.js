import { graphql, useStaticQuery } from 'gatsby'

export const useLatestProjects = () => {
  const { latestProjects } = useStaticQuery(graphql`query getLatestProjects {
      latestProjects: allMarkdownRemark(
          filter: {isFuture: {eq: false}, frontmatter: {key: {eq: "project"}, isDraft: {eq: false}}}
          sort: {fields: frontmatter___content___publishDate, order: ASC}
          limit: 3
      ) {
          edges {
              node {
                  fields {
                      slug
                  }
                  frontmatter {
                      content {
                          name
                          publishDate
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
  }
  `)

  return latestProjects.edges
};
