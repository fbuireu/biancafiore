const ARTICLES_QUERY = `{
  articles: allMarkdownRemark (
    filter: { frontmatter: { key: { eq: "article" }}},
    sort: { 
      fields: frontmatter___content___publishDate, 
      order: DESC }) {
    edges {
      node {
        html
        excerpt (pruneLength: 350)
        fields {
          slug
        }
        objectID: id
        frontmatter {
          type: key
          language
          author
          content {
            title
            summary
            publishDate
            lastUpdated
            readingTime
            isFeaturedArticle
            tags
            featuredImage {
              childImageSharp {
                fluid {
                  aspectRatio
                  src
                  srcSet
                  sizes
                  originalImg
                  originalName
                }
              }
            } 
          }
        }
      }
    }
  }
}`;

const PROJECTS_QUERY = `{
  projects: allMarkdownRemark(
    filter: { frontmatter: { key: { eq: "project" }}}, 
    sort: { fields: frontmatter___content___publishDate, order: DESC }) {
    edges {
      node {
        html
        excerpt(pruneLength: 350)
        objectID: id
        frontmatter {
          type: key
          language
          name
          content {
            publishDate
            tags
            featuredImage {
              childImageSharp {
                fluid {
                  aspectRatio
                  src
                  srcSet
                  sizes
                  originalImg
                  originalName
                }
              }
            }
          }
        }
      }
    }
  }
}`;

// const PROJECTS_AND_ARTICLES_QUERY=`{
//   projctsAndArticles: allMarkdownRemark(
//     filter: { frontmatter: { key: { in: ["project", "article"]}}},
//     sort: { fields: frontmatter___publishDate, order: DESC }) {
//     edges {
//       node {
//         html
//         excerpt(pruneLength: 350)
//         objectID: id
//         frontmatter {
//           type: key
//           language
//           name
//           publishDate
//           tags
//           featuredImage {
//             childImageSharp {
//               fluid {
//                 aspectRatio
//                 src
//                 srcSet
//                 sizes
//                 originalImg
//                 originalName
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }`;

const flatten = data => data.map(({ node: { frontmatter, ...rest } }) => ({ ...frontmatter, ...rest })),
  SETTINGS = { attributesToSnippet: [`excerpt: 200`] },
  algoliaQueries = [
    {
      query: ARTICLES_QUERY,
      transformer: ({ data }) => flatten(data.articles.edges),
      indexName: process.env.GATSBY_ALGOLIA_ARTICLES_INDEX_NAME,
      SETTINGS,
      matchFields: [`fields.slug`, `content.title`,`content.lastUpdated`]
    },
    {
      query: PROJECTS_QUERY,
      transformer: ({ data }) => flatten(data.projects.edges),
      indexName: process.env.GATSBY_ALGOLIA_PROJECTS_INDEX_NAME,
      SETTINGS,
      matchFields: [`content.name`, `content.publishDate`]
    },
    // {
    //   query: PROJECTS_AND_ARTICLES_QUERY,
    //   transformer: ({ data }) => flatten(data.projctsAndArticles.edges),
    //   indexName: process.env.GATSBY_ALGOLIA_PROJECTS_INDEX_NAME,
    //   SETTINGS,
    //   matchFields: [`fields.slug`, `content.title`,`content.lastUpdated`, `name`]
    // },
  ];

module.exports = algoliaQueries;