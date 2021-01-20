import PropTypes from 'prop-types';
import React from 'react';
import SEO from '../components/atoms/SEO/SEO';
import Layout from '../components/templates/Layout/Layout';

const Index = props => {
  return <h1 style={{
    textAlign: `center`,
    marginTop: `50vh`,
    fontSize: `52px`
  }}>Site under construction<br />We&apos;ll back soon</h1>;
  // return <Layout>
  //   <SEO title="Home" />
  //   <h1>Hi people</h1>
  //   <p>This will be an amazing portfolio for the best content writer ever.</p>
  //   <p>Now go build something great.</p>
  // </Layout>;
};

Index.propTypes = {
  // data: PropTypes.objectOf(PropTypes.object).isRequired,
};

Index.defaultProps = {};

export default Index;
