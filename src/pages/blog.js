import React from 'react';
import Seo from '../components/atoms/Seo/Seo';
import BlogArticles from '../components/organisms/BlogArticles/BlogArticles';
import Layout from '../components/templates/Layout/Layout';

const Blog = () => {
  return <Layout>
    <Seo title="Blog" />
    <section className={`wrapper`}>
      <BlogArticles />
    </section>
  </Layout>;
};

Blog.propTypes = {};

Blog.defaultProps = {};

export default Blog;
