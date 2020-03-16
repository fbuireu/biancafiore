import React from 'react';
import Layout from '../components/layout';
import Image from '../components/image';
import SEO from '../components/seo';

const Index = () => (
  <Layout>
    <SEO title="Home" />
    <h1>Hi people</h1>
    <p>This will be an amazing portfolio for the best content writer ever.</p>
    <p>Now go build something great.</p>
    <div>
      <Image />
    </div>
  </Layout>
);

export default Index;
