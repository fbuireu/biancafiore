const { createFilePath } = require(`gatsby-source-filesystem`);
const { fmImagesToRelative } = require(`gatsby-remark-relative-images-v2`);
const articlesBuilder = require(`./src/build/articlesBuilder`);
const projectsBuilder = require(`./src/build/projectsBuilder`);
const tagsBuilder = require(`./src/build/tagsBuilder`);
const get = require(`lodash.get`)
const path = require(`path`);

exports.createPages = async ({ graphql, actions, reporter }) => {
  await Promise.allSettled([
    articlesBuilder(graphql, actions, reporter),
    projectsBuilder(graphql, actions, reporter),
    tagsBuilder(graphql, actions, reporter)
  ]);
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

exports.onCreateWebpackConfig = ({ stage, actions, loaders, getConfig }) => {
  const config = getConfig();

  config.module.rules = [
    ...config.module.rules.filter(rule => String(rule.test) !== String(/\.jsx?$/)),
    {
      test: /canvg/,
      use: loaders.null()
    },
    {
      test: /\.jsx?$/,
      use: { ...loaders.js() },
      exclude: modulePath => /node_modules/.test(modulePath)
    }
  ];

  if (stage === `build-html`) {
    actions.setWebpackConfig({
      resolve: {
        modules: [path.resolve(__dirname, `src`), `node_modules`]
      }
    });
  }
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes, createFieldExtension } = actions

  const isFuture = fieldName => source => {
    const date = get(source, fieldName)

    return new Date(date) > new Date()
  }

  createFieldExtension({
    name: `isFuture`,
    args: {
      fieldName: `String!`,
    },
    extend({ fieldName }) {
      return {
        resolve: isFuture(fieldName),
      }
    },
  })

  createTypes(`
    type MarkdownRemark implements Node {
      isFuture: Boolean! @isFuture(fieldName: "frontmatter.publishDate")
    }
  `)
}