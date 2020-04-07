import React from 'react';
import Image from '../components/atoms/Image/Image';
import SEO from '../components/organisms/SEO/SEO';
import Layout from '../components/templates/Layout/Layout';

const Index = props => {
  return <Layout>
    <SEO title="Home" />
    <h1>Hi people</h1>
    <p>This will be an amazing portfolio for the best content writer ever.</p>
    <p>Now go build something great.</p>
    <div>
      <Image />
    </div>
  </Layout>;
};

export default Index;
