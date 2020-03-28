import { graphql, useStaticQuery } from 'gatsby';

export const useMenuItems = () => {
  const { menuItems } = useStaticQuery(graphql`
      {
          menuItems:allMarkdownRemark(
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

  return menuItems.edges;
};
