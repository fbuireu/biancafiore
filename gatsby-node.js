const home = require(`./src/build/home`);

exports.createPages = async ({ graphql, actions, reporter }) => {
  await Promise.all(
    [
      home(graphql, actions, reporter),
    ],
  );
};
