import React from 'react';
import Layout from '../components/templates/Layout/Layout';
import Image from '../components/atoms/Image/Image';
import Seo from '../components/organisms/Seo';

const Index = props => {
  return <Layout>
    <Seo title="Home" />
    <h1>Hi people</h1>
    <p>This will be an amazing portfolio for the best content writer ever.</p>
    <p>Now go build something great.</p>
    <div>
      <Image />
    </div>
  </Layout>;
};

export default Index;
