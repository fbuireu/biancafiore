const { createFilePath } = require(`gatsby-source-filesystem`);
const { fmImagesToRelative } = require(`gatsby-remark-relative-images-v2`);
const articlesBuilder = require(`./src/build/articlesBuilder`);
const tagsBuilder = require(`./src/build/tagsBuilder`);
const path = require(`path`);

exports.createPages = async ({ graphql, actions, reporter }) => {
  await articlesBuilder(graphql, actions, reporter);
  await tagsBuilder(graphql, actions, reporter);
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

exports.onCreateWebpackConfig = ({ actions, loaders, getConfig }) => {
  const config = getConfig();

  config.module.rules = [
    ...config.module.rules.filter(rule => String(rule.test) !== String(/\.jsx?$/)),
    {
      test: /canvg/,
      use: loaders.null(),
    },
    {
      test: /\.jsx?$/,
      use: { ...loaders.js() },
      exclude: modulePath => /node_modules/.test(modulePath),
    },
  ];

  actions.setWebpackConfig({
    resolve: {
      modules: [path.resolve(__dirname, `src`), `node_modules`],
    },
  });
};
