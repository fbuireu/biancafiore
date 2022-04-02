const path = require(`path`);

const projectsBuilder = async (graphql, { createPage }, reporter) => {
  const PROJECT_TEMPLATE = path.resolve(`./src/components/templates/Project/Project.js`);

  const { data: { projects: { edges: projects } } } = await graphql(`
    query getAllProjectsOrderedByDate {
      projects: allMarkdownRemark (
        filter: {
          isFuture: { eq: false }, 
          frontmatter: {
            key: { eq: "project" }, 
            isDraft: { eq: false }
          }
        }, 
        sort: { 
          fields: frontmatter___content___publishDate, 
          order: ASC 
        }) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              content {
                tags
              }
            }
          }
        }
      }
    }
  `);

  if (!projects) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);

    return;
  }

  projects.forEach(({ node: project }) => {
    let { fields: { slug }, frontmatter: { content: { tags } } } = project;

    createPage({
      path: `/projects${slug}`,
      component: PROJECT_TEMPLATE,
      context: {
        slug,
        tags
      }
    });
  });
};

module.exports = projectsBuilder;