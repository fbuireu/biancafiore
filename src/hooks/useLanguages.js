import { graphql, useStaticQuery } from 'gatsby';

export const useLanguages = () => {
  const { languages } = useStaticQuery(graphql`
      query getAllLanguages{
          languages: allMarkdownRemark(
              filter: { frontmatter: { key: { eq: "tag" }}}
          ) {
              edges {
                  node {
                      frontmatter {
                          key
                          name
                          isoCode
                      }
                  }
              }
          }
      }
  `);

  let availableLanguages = [];

  languages.edges.forEach(({ node }) => {
    let { name, isoCode } = node.frontmatter;

    (name || isoCode) && availableLanguages.push({ name: name, isoCode: isoCode });
  });

  return availableLanguages;
};
