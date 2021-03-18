import { graphql, useStaticQuery } from 'gatsby';

export const useFooterItems = () => {
  const { footerItems } = useStaticQuery(graphql`
      query getAllFooterItems {
          footerItems: allMarkdownRemark (
              filter: { frontmatter: { key: { eq: "footerItem" }}},
              sort: {
                  fields: [frontmatter___position],
                  order: ASC }){
              edges {
                  node {
                      frontmatter {
                          name
                          url
                          position
                      }
                  }
              }
          }
      }
  `);

  return footerItems.edges;
};
