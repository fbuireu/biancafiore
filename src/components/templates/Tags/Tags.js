import React from 'react';
import SEO from '../../atoms/SEO/SEO';
import Layout from '../Layout/Layout';

const Tags = props => {
  return <Layout>
    <SEO title="Home"/>
    <h1>Hi people</h1>
    <p>This will be an amazing portfolio for the best content writer ever.</p>
    <p>Now go build something great.</p>
  </Layout>;
};

Tags.propTypes = {};

Tags.defaultProps = {};

export default Tags;
