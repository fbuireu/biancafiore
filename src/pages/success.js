import PropTypes from 'prop-types';
import React from 'react';
import SEO from '../components/atoms/SEO/SEO';
import Layout from '../components/templates/Layout/Layout';

const Success = props => {
  return <Layout>
    <SEO title="Success" />
    <h1>Thank you</h1>
  </Layout>;
};

Success.propTypes = {
};

Success.defaultProps = {};

export default Success;
