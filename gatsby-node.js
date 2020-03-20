const { createFilePath } = require(`gatsby-source-filesystem`);
const { fmImagesToRelative } = require(`gatsby-remark-relative-images`);
const homeBuilder = require(`./src/build/homeBuilder`);
const articlesBuilder = require(`./src/build/articlesBuilder`);
const tagsBuilder = require(`./src/build/tagsBuilder`);

exports.createPages = async ({ graphql, actions, reporter }) => {
  await Promise.all(
    [
      homeBuilder(graphql, actions, reporter),
      articlesBuilder(graphql, actions, reporter),
      tagsBuilder(graphql, actions, reporter),
    ],
  );
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  fmImagesToRelative(node);

  if (node.internal.type === `MarkdownRemark`) {
    let value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};