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
      node.frontmatter.content.tags.map(
        tag => tags.push(slugify(tag, { lower: true })),
      );
    }
    if (node.frontmatter.locale) tags.push(
      slugify(node.frontmatter.locale, { lower: true }));

    return Array.from(new Set(tags));
  });
  console.log('tags', tags);
  // tags.forEach(tag => {
  //   createPage({
  //     path: `${node.frontmatter.key}${node.frontmatter.iso}`,
  //     component: tagsTemplate,
  //     context: {},
  //   });
  // });

}

module.exports = tagsBuilder;