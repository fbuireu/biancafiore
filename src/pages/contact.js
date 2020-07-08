import React from 'react';
import Seo from '../components/atoms/Seo/Seo';
import ContactForm from '../components/molecules/ContactForm/ContactForm';
import Layout from '../components/templates/Layout/Layout';

const Blog = () => {
  return <Layout>
    <Seo title="Contact" />
    <section className={`wrapper`}>
      <ContactForm />
    </section>
  </Layout>;
};

Blog.propTypes = {};

Blog.defaultProps = {};

export default Blog;





