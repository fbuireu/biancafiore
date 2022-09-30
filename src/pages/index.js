import { graphql } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'

const Index = ({
  location,
  data: {
    home: {
      edges: [
        {
          node: {
            frontmatter: {
              jumbotron,
              testimonials,
              myWork,
              latestArticles,
            },
          },
        }],
    },
  },
}) => {

  return <h1 style={{
    textAlign: `center`,
    marginTop: `50vh`,
    fontSize: `52px`,
  }}>Site under construction<br/>We&apos;ll be back soon</h1>

  // return <Layout>
  //   <SEO title="Home" />
  //   <HomeJumbotron {...jumbotron} />
  //   <Testimonials {...testimonials} />
  //   <MyWork {...myWork} />
  //   <HomeLatestArticles {...latestArticles} />
  // </Layout>;
};

export const homeData = graphql`query getHomeData {
    home: allMarkdownRemark(filter: {frontmatter: {key: {eq: "home"}}}) {
        edges {
            node {
                html
                frontmatter {
                    title
                    jumbotron {
                        welcomeDescription
                        welcomeTextLeft
                        welcomeTextRight
                        welcomeImage {
                            childImageSharp {
                                gatsbyImageData(width: 400, height: 400, layout: FIXED)
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
                                    gatsbyImageData(layout: FULL_WIDTH)
                                }
                            }
                        }
                    }
                    myWork {
                        title
                    }
                    latestArticles {
                        title
                    }
                }
            }
        }
    }
}
`

Index.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired,
  location: PropTypes.objectOf(PropTypes.object).isRequired
};

Index.defaultProps = {};

export default Index;
