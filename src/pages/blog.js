import React from 'react';
import SEO from '../components/atoms/SEO/SEO';
import BlogArticles from '../components/organisms/BlogArticles/BlogArticles';
import Layout from '../components/templates/Layout/Layout';

const Blog = () => {
  return <Layout>
    <SEO title="Blog" />
    <section className={`wrapper`}>
      <BlogArticles />
    </section>
  </Layout>;
};

Blog.propTypes = {};

Blog.defaultProps = {};

export default Blog;
