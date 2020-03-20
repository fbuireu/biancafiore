const path = require(`path`);
const slugify = require(`slugify`);

async function tagsBuilder (graphql, { createPage }, reporter) {
  const tagsTemplate = path.resolve(
    `./src/components/templates/tags.js`);

  const tagsQuery = await graphql(`
    {
      allMarkdownRemark{
        edges {
          node {
            frontmatter {
              key
              locale
              iso
              content {
                tags
                body
              }
            }
          }
        }
      }
    }
  `);

  if (tagsQuery.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);

    return true;
  }

  let tags = [];
  const posts = tagsQuery.data.allMarkdownRemark.edges;

  posts.map(({ node }) => {
    if (node.frontmatter.content && node.frontmatter.content.tags) {
      node.frontmatter.content.tags.map(tag => tags.push(slugify(tag)));
    } else if (node.frontmatter.iso && node.frontmatter.content) {
      console.log('isoo', node.frontmatter.iso);
      tags.push(node.frontmatter.iso);
    }
    console.log('TAGS', tags);
    return tags;
  });

  // createPage({
  //   path: `${node.frontmatter.key}${node.frontmatter.iso}`,
  //   component: tagsTemplate,
  //   context: {},
  // });

}

module.exports = tagsBuilder;