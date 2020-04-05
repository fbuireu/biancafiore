const { createFilePath } = require(`gatsby-source-filesystem`);
const { fmImagesToRelative } = require(`gatsby-remark-relative-images`);
const articlesBuilder = require(`./src/build/articlesBuilder`);
const tagsBuilder = require(`./src/build/tagsBuilder`);

exports.createPages = async ({ graphql, actions, reporter }) => {
  await Promise.all(
    [
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

exports.onCreateWebpackConfig = ({ loaders, getConfig, stage }) => {
  const config = getConfig();

  config.module.rules = [
    ...config.module.rules.filter(
      rule => String(rule.test) !== String(/\.jsx?$/),
    ), {
      ...loaders.js(),
      test: /\.jsx?$/,
      exclude: modulePath => /node_modules/.test(modulePath),
    },
  ];
};