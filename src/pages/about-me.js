import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import CityInformation from '../components/atoms/CityInformation/CityInformation';
import SEO from '../components/atoms/SEO/SEO';
import Map from '../components/molecules/Map/Map';
import Layout from '../components/templates/Layout/Layout';

const AboutMe = ({ data }) => {
  const [selectedCity, setSelectedCity] = useState(undefined),
    { aboutMe } = data;
  let cities = aboutMe.edges[0].node.frontmatter.cities;

  cities.map(city => {
    if (typeof city.coordinates === `string`) return city.coordinates = JSON.parse(city.coordinates);
  });

  const showCityInformation = selectedCity => {
    let { description: cityInformation } = cities.find(city => city.name === selectedCity);
    setSelectedCity(cityInformation);
  };

  return <Layout>
    <SEO title="Home" />
    <Map cities={cities} showCityInformation={showCityInformation} />
    {!selectedCity ? <p dangerouslySetInnerHTML={{ __html: aboutMe.edges[0].node.html }} /> : <CityInformation cityInformation={selectedCity} />}
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
