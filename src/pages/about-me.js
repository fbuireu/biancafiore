import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

import Map from '../components/organisms/Map/Map';
import SEO from '../components/organisms/SEO/SEO';
import Layout from '../components/templates/Layout/Layout';

const AboutMe = ({ data }) => {
  const { aboutMe } = data;
  let cities = aboutMe.edges[0].node.frontmatter.cities;

  for (let city of cities) if (typeof city.coordinates === `string`) city.coordinates = JSON.parse(city.coordinates);

  return <Layout>
    <SEO title="Home" />
    <h1>Hi About page</h1>
    <p>This will be an amazing portfolio for the best content writer ever.</p>
    <p>Now go build something great.</p>
    <Map cities={cities} />
  </Layout>;
};

export const AboutMeData = graphql`
    query getAboutMeData {
        aboutMe: allMarkdownRemark(filter: { frontmatter: { key: { eq: "about-me" }}}) {
            edges {
                node {
                    html
                    frontmatter {
                        cities {
                            name
                            isInitialCity
                            coordinates
                            countryIsoCode
                            description
                        }
                    }
                }
            }
        }
    }
`;

AboutMe.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired,
};

AboutMe.defaultProps = {};

export default AboutMe;
