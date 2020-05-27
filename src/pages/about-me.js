import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import CityInformation from '../components/atoms/CityInformation/CityInformation';
import SEO from '../components/atoms/SEO/SEO';
import Map from '../components/molecules/Map/Map';
import Layout from '../components/templates/Layout/Layout';

const AboutMe = ({ data }) => {
  const [cityInformation, updateCityInformation] = useState(undefined),
    { aboutMe, citiesInformation } = data;
  let cities = [];

  citiesInformation.edges.forEach(({ node: city }) => {
    let { name, isInitialCity, coordinates, countryIsoCode } = city.frontmatter;

    cities.push({
      name: name,
      isInitialCity: isInitialCity,
      coordinates: typeof coordinates === `string` && JSON.parse(coordinates),
      countryIsoCode: countryIsoCode,
      description: city.html,
    });
  });

  const showCityInformation = selectedCity => {
    let { description } = cities.find(city => city.name === selectedCity);
    updateCityInformation(description);
  };

  return <Layout>
    <SEO title="Home" />
    <Map cities={cities} showCityInformation={showCityInformation} />
    {!cityInformation ? <p dangerouslySetInnerHTML={{ __html: aboutMe.edges[0].node.html }} /> : <CityInformation cityInformation={cityInformation} />}
  </Layout>;
};

export const AboutMeData = graphql`
    query getAboutMeData {
        aboutMe: allMarkdownRemark(filter: { frontmatter: { key: { eq: "about-me" }}}) {
            edges {
                node {
                    html
                    frontmatter {
                        cities
                    }
                }
            }
        }
        citiesInformation: allMarkdownRemark(filter: { frontmatter: { key: { eq: "city" }}}) {
            edges {
                node {
                    html
                    frontmatter {
                        name
                        isInitialCity
                        coordinates
                        countryIsoCode
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
