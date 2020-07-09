import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import Seo from '../components/atoms/Seo/Seo';
import ContactForm from '../components/molecules/ContactForm/ContactForm';
import Layout from '../components/templates/Layout/Layout';

const Contact = ({ data }) => {
  const { formInputs } = data.contact.edges[0].node.frontmatter;

  return <Layout>
    <Seo title="Contact" />
    <section className={`wrapper`}>
      <ContactForm formInputs={formInputs} />
    </section>
  </Layout>;
};

export const contactData = graphql`
    query getContactData {
        contact: allMarkdownRemark(
            filter: { frontmatter: { key: { eq: "contact" }}}) {
            edges {
                node {
                    html
                    frontmatter {
                        formInputs {
                            name
                            type
                            isRequired
                            label
                            isValid
                            errorMessage
                        }
                    }
                }
            }
        }
    }
`;

Contact.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired,
};

Contact.defaultProps = {};

export default Contact;





