import { graphql } from 'gatsby'
import PropTypes from 'prop-types'
import SEO from '../components/atoms/SEO/SEO'
import ContactForm from '../components/molecules/ContactForm/ContactForm'
import ContactJumbotron
  from '../components/molecules/ContactJumbotron/ContactJumbotron'
import Layout from '../components/templates/Layout/Layout'
import React from 'react'

const Contact = ({
  location,
  data: {
    contact: {
      edges: [
        {
          node: {
            frontmatter: { jumbotron, form },
          },
        },
      ],
    },
  },
}) => {
  return (
    <Layout>
      <SEO title="Contact"/>
      <section className={`wrapper`}>
        <ContactJumbotron jumbotron={jumbotron} location={location}/>
        <ContactForm form={form}/>
      </section>
    </Layout>
  )
};

export const contactData = graphql`
    query getContactData {
        contact: allMarkdownRemark(
            filter: { frontmatter: { key: { eq: "contact" } } }
        ) {
            edges {
                node {
                    html
                    frontmatter {
                        jumbotron {
                            welcomeText
                            welcomeDescription
                            image {
                                childImageSharp {
                                    gatsbyImageData(width: 400, height: 400, layout: FIXED)
                                }
                            }
                        }
                        form {
                            formTitle
                            formDescription
                            formInputs {
                                name
                                type
                                isRequired
                                label
                                placeholder
                                value
                                isValid
                                errorMessage
                            }
                            submitCtaMessages {
                                status
                                text
                            }
                            helperMessages {
                                status
                                message
                            }
                        }
                    }
                }
            }
        }
    }
`

Contact.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired,
  location: PropTypes.objectOf(PropTypes.object).isRequired,
};

Contact.defaultProps = {};

export default Contact;
