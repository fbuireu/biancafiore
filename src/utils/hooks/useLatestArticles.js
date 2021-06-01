import { graphql, useStaticQuery } from 'gatsby';

export const useLatestArticles = () => {
  const { latestArticles } = useStaticQuery(graphql`
      query getLatestArticles {
          latestArticles: allMarkdownRemark(
              filter: {
                  isFuture: { eq: false }
                  frontmatter: {
                      key: { eq: "article" },
                      isDraft: { eq: false }
                  }
              },
              sort: {
                  fields: frontmatter___content___publishDate,
                  order: DESC
              }) {
              edges {
                  node {
                      excerpt(pruneLength: 350)
                      fields {
                          slug
                      }
                      frontmatter {
                          author
                          content {
                              title
                              summary
                              publishDate
                              featuredImage {
                                  childImageSharp {
                                      fluid {
                                          ...GatsbyImageSharpFluid
                                      }
                                  }
                              }
                          }
                      }
                  }
              }
          }
      }
  `);

  return latestArticles.edges;
};
