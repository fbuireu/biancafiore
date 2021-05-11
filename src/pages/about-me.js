import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Map from '../components/atoms/Map/Map';
import SEO from '../components/atoms/SEO/SEO';
import AboutMeJumbotron from '../components/molecules/AboutMeJumbotron/AboutMeJumbotron';
import Timeline from '../components/molecules/Timeline/Timeline';
import Layout from '../components/templates/Layout/Layout';

const AboutMe = ({
  data: {
    aboutMe: {
      edges: [{
        node: {
          frontmatter: {
            jumbotron,
            map: { cities: mapCities },
            timeline: { title, years }
          }
        }
      }]
    }, citiesDetails
  }
}) => {
  let cities = [];

  citiesDetails.edges.forEach(({ node: city }) => {
    let {
      frontmatter: {
        name, isInitialCity, coordinates, countryIsoCode
      }
    } = city;

    if (mapCities.includes(name)) {
      cities.push({
        name,
        isInitialCity,
        coordinates: typeof coordinates === `string` && JSON.parse(coordinates),
        countryIsoCode
      });
    }
  });

  let initialCity = cities?.find(({ isInitialCity }) => isInitialCity);

  if (years[years.length - 1].city === initialCity?.name) years.reverse();

  const [selectedCityIndex, setSelectedCityIndex] = useState(years.findIndex(({ city }) => city === initialCity?.name));
  const [selectedCityName, setSelectedCityName] = useState(initialCity);

  function findSelectedCityIndexByName(selectedCity) {
    setSelectedCityIndex(years.findIndex(({ city: name }) => name === selectedCity));
  }

  function findSelectedCityNameByIndex(selectedIndex) {
    setSelectedCityName(years[selectedIndex].city);
  }

  return <Layout>
    <SEO title="Home" />
    <AboutMeJumbotron jumbotron={jumbotron} />
    <Timeline
      title={title}
      years={years}
      findSelectedCityNameByIndex={findSelectedCityNameByIndex}
      selectedCityIndex={selectedCityIndex}
    />
    <Map
      cities={cities}
      findSelectedCityIndexByName={findSelectedCityIndexByName}
      selectedCityName={selectedCityName}
    />
  </Layout>;
};

export const aboutMeData = graphql`
    query getAboutMeData {
        aboutMe: allMarkdownRemark(
            filter: { frontmatter: { key: { eq: "about-me" }}}
            sort: { fields: frontmatter___timeline___years___city, order: ASC }) {
            edges {
                node {
                    html
                    frontmatter {
                        jumbotron {
                            leftSide {
                                title
                                welcomeText
                                welcomeDescription
                                cta
                            }
                            rightSide {
                                socialNetworks
                                image {
                                    childImageSharp {
                                        fixed(width: 400, height: 400) {
                                            ...GatsbyImageSharpFixed_withWebp
                                        }
                                    }
                                }
                            }
                        }
                        map {
                            cities
                        }
                        timeline {
                            title
                            years {
                                year
                                city
                                description
                                image {
                                    childImageSharp {
                                        fluid {
                                            ...GatsbyImageSharpFluid_withWebp
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        citiesDetails: allMarkdownRemark(
            filter: { frontmatter: { key: { eq: "city" }}}
            sort: { fields: frontmatter___name, order: ASC }) {
            edges {
                node {
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
  data: PropTypes.objectOf(PropTypes.object).isRequired
};

AboutMe.defaultProps = {};

export default AboutMe;
