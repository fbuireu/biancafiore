import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import SEO from '../components/atoms/SEO/SEO';
import HomeJumbotron from '../components/molecules/HomeJumbotron/HomeJumbotron';
import HomeLatestArticles from '../components/molecules/HomeLatestArticles/HomeLatestArticles';
import MyWork from '../components/molecules/MyWork/MyWork';
import Testimonials from '../components/molecules/Testimonials/Testimonials';
import Layout from '../components/templates/Layout/Layout';

const Index = ({
  data: {
    home: {
      edges: [{
        node: {
          frontmatter: {
            jumbotron,
            testimonials: { title: testimonialsTitle, subtitle, testimonials },
            myWork: { title: myWorkTitle, works },
            latestArticles: { title: latestArticlesTitle }
          }
        }
      }]
    }
  }
}) => {

  // return <h1 style={{
  //   textAlign: `center`,
  //   marginTop: `50vh`,
  //   fontSize: `52px`
  // }}>Site under construction<br />We&apos;ll be back soon</h1>;

  return <Layout>
    <SEO title="Home" />
    <HomeJumbotron jumbotron={jumbotron} />
    <Testimonials title={testimonialsTitle} subtitle={subtitle} testimonials={testimonials} />
    <MyWork title={myWorkTitle} works={works} />
    <HomeLatestArticles title={latestArticlesTitle} />
  </Layout>;
};

export const homeData = graphql`
    query getHomeData {
        home: allMarkdownRemark(filter: { frontmatter: { key: { eq: "home" }}}) {
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
                        myWork {
                            title
                            works {
                                tags
                                image {
                                    childImageSharp {
                                        fluid {
                                            ...GatsbyImageSharpFluid
                                        }
                                    }
                                }
                            }
                        }
                        latestArticles {
                            title
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
