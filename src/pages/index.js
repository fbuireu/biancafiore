import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

const Index = ({ data }) => {
  const {
    home: {
      edges: [{
        node: {
          html,
          frontmatter: { jumbotron, testimonials: { title, subtitle, testimonials } }
        }
      }]
    }
  } = data;

  return <h1 style={{
    textAlign: `center`,
    marginTop: `50vh`,
    fontSize: `52px`
  }}>Site under construction<br />We&apos;ll be back soon</h1>;

  // return <Layout>
  //   <SEO title="Home"/>
  //   <h1>Hi people</h1>
  //   <Jumbotron jumbotron={jumbotron}/>
  //   <Testimonials title={title} subtitle={subtitle} testimonials={testimonials}/>
  // </Layout>;
};

export const homeData = graphql`
    query getHomeData {
        home: allMarkdownRemark(filter: {frontmatter: {key: {eq: "home"}}}) {
            edges {
                node {
                    html
                    frontmatter {
                        title
                        jumbotron{
                            welcomeDescription
                            welcomeTextLeft
                            welcomeTextRight
                            welcomeImage {
                                childImageSharp {
                                    fixed(width: 400, height: 400) {
                                        ...GatsbyImageSharpFixed_withWebp
                                    }
                                }
                            }
                        }
                        testimonials {
                            title
                            subtitle
                            testimonials {
                                author
                                quote
                                description
                                image {
                                    childImageSharp {
                                        fluid {
                                            ...GatsbyImageSharpFluid
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

Index.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired
};

Index.defaultProps = {};

export default Index;
