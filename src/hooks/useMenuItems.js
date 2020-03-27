import { graphql, useStaticQuery } from 'gatsby';

export const useMenuItems = () => {
  const {allMarkdownRemark} = useStaticQuery(graphql`
      {
          allMarkdownRemark(
              filter: { frontmatter: { key: { eq: "menuItem" }}},
              sort: { order: ASC, fields: [frontmatter___position] }) {
              edges {
                  node {
                      fields {
                          slug
                      }
                      frontmatter {
                          name
                          position
                      }
                  }
              }
          }
      }
  `);

  return allMarkdownRemark.edges;
};
