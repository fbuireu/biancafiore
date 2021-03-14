import { graphql, useStaticQuery } from 'gatsby';

export const useLatestArticles = () => {
  const { latestArticles } = useStaticQuery(graphql`query getLatestArticles {
  latestArticles: allMarkdownRemark(
    filter: {frontmatter: {key: {eq: "article"}, isDraft: {eq: false}}}
    sort: {fields: frontmatter___content___publishDate, order: DESC}
  ) {
    edges {
      node {
        fields {
          slug
        }
        frontmatter {
          author
          content {
            title
            publishDate
            featuredImage {
              childImageSharp {
                gatsbyImageData(placeholder: BLURRED, layout: FULL_WIDTH)
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
