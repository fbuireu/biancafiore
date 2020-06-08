import { graphql, useStaticQuery } from 'gatsby';

export const useMenuItems = () => {
  const { menuItems } = useStaticQuery(graphql`
      query getAllMenuItemsOrderedByPositionAsc {
          menuItems: allMarkdownRemark (
              filter: { frontmatter: { key: { eq: "menuItem" }}},
              sort: { 
                  fields: [frontmatter___position], 
                  order: ASC }){
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
