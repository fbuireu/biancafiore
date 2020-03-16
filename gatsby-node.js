const pages = require(`./src/build/pages`);

exports.createPages = async ({ graphql, actions }) => {
  await Promise.all(
    [
      // pages(graphql, actions),
    ],
  );
};
