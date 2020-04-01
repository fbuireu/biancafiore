import { graphql, useStaticQuery } from 'gatsby';

export const useLanguages = () => {
  const { languages } = useStaticQuery(graphql`
      query {
          languages: allMarkdownRemark(
              filter: { frontmatter: { key: { eq: "tag" }}}
          ) {
              edges {
                  node {
                      frontmatter {
                          key
                          name
                          iso
                      }
                  }
              }
          }
      }
  `);

  let availableLanguages = [];

  languages.edges.forEach(({ node }) => {
    let { name, iso } = node.frontmatter;

    (name || iso) && availableLanguages.push({ name: name, iso: iso });
  });

  return availableLanguages;
};
