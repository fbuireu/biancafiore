import PropTypes from 'prop-types';
import React from 'react';
import Seo from '../components/atoms/Seo/Seo';
import Layout from '../components/templates/Layout/Layout';

const Index = props => {
  return <Layout>
    <Seo title="Home" />
    <h1>Hi people</h1>
    <p>This will be an amazing portfolio for the best content writer ever.</p>
    <p>Now go build something great.</p>
  </Layout>;
};

Index.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired,
};

Index.defaultProps = {};

export default Index;
