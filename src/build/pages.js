const path = require('path');

async function pages (graphql, { createPage }, reporter) {
  const DatosForm = path.resolve(__dirname + '/../templates/formTemplate.js');

  const formsQuery = await graphql(`
`);

  const resultForms = formsQuery.data.allDatoCmsForm.edges;

  resultForms.map(node => {
    createPage({
      path: node.node.url + `/`,
      component: DatosForm,
      context: {
        name: node.node.name,
      },
    });
  });
}

module.exports = pages;