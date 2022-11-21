import {graphql, useStaticQuery} from 'gatsby';

export const useSocialNetworkItems = () => {
  const { socialNetworkItems } = useStaticQuery(graphql`
      query getAllsocialNetworkItem {
          socialNetworkItems: allMarkdownRemark(
              filter: { frontmatter: { key: { eq: "socialNetworkItem" } } }
              sort: { frontmatter: { position: ASC }}
          ) {
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

  return socialNetworkItems.edges;
};
