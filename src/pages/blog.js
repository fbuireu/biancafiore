import React from 'react';
import Seo from '../components/atoms/Seo/Seo';
import Filter from '../components/organisms/Filter/Filter';
import Layout from '../components/templates/Layout/Layout';

const Blog = () => {
  return <Layout>
    <Seo title="Blog" />
    <section className={`wrapper`}>
      <Filter />
    </section>
  </Layout>;
};

Blog.propTypes = {
};

Blog.defaultProps = {};

export default Blog;
