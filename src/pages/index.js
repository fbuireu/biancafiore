import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

const Index = ({ data }) => {
  const { home: { edges: [{ node: { html, frontmatter: { image: bianca, testimonials } } }] } } = data;

  return <h1 style={{
    textAlign: `center`,
    marginTop: `50vh`,
    fontSize: `52px`
  }}>Site under construction<br />We&apos;ll be back soon</h1>;


  // return <Layout>
  //   <SEO title="Home" />
  //   <h1>Hi people</h1>
  //   <Markdown>{html}</Markdown>
  //   <Testimonials testimonials={testimonials} />
  //   {/*<Tilt gyroscope={true} tiltMaxAngleX={5} tiltMaxAngleY={5}>*/}
  //   {/*  <Img fluid={bianca.childImageSharp?.fluid} />*/}
  //   {/*</Tilt>*/}
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
#            jumbotron{
#              welcomeImage {
#                childImageSharp {
#                  fixed(width: 400, height: 400) {
#                    ...GatsbyImageSharpFixed_withWebp
#                  }
#                }
#              }
#            }
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
`;

Index.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired
};

Index.defaultProps = {};

export default Index;
