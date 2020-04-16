import React from 'react';
import SEO from '../components/organisms/SEO/SEO';
import Layout from '../components/templates/Layout/Layout';

const AboutMe = props => {
  return <Layout>
    <SEO title="Home" />
    <h1>Hi About page</h1>
    <p>This will be an amazing portfolio for the best content writer ever.</p>
    <p>Now go build something great.</p>
  </Layout>;
};

export default AboutMe;
