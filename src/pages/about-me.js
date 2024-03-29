import {graphql} from 'gatsby';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Map from '../components/atoms/Map/Map';
import SEO from '../components/atoms/SEO/SEO';
import AboutMeJumbotron from '../components/molecules/AboutMeJumbotron/AboutMeJumbotron';
import Timeline from '../components/molecules/Timeline/Timeline';
import AboutMeLatestArticles from '../components/organisms/AboutMeLatestArticles/AboutMeLatestArticles';
import Layout from '../components/templates/Layout/Layout';

const AboutMe = ({
  location,
  data: {
    aboutMe: {
      edges: [
        {
          node: {
            frontmatter: {
              jumbotron,
              map: { cities: mapCities },
              timeline: { title, years },
              latestArticles: latestArticlesData,
            },
          },
        },
      ],
    },
    citiesDetails,
  },
}) => {
  let cities = [];

  citiesDetails.edges.forEach(({ node: city }) => {
    let {
      frontmatter: { name, isInitialCity, coordinates, countryIsoCode },
    } = city;

    if (mapCities.includes(name)) {
      cities.push({
        name,
        isInitialCity,
        coordinates: typeof coordinates === `string` && JSON.parse(coordinates),
        countryIsoCode,
      });
    }
  });

  let initialCity = cities?.find(({ isInitialCity }) => isInitialCity)

  if (years[years.length - 1].city === initialCity?.name) years.reverse()

  const [selectedCityIndex, setSelectedCityIndex] = useState(
    years.findIndex(({ city }) => city === initialCity?.name),
  )
  const [selectedCityName, setSelectedCityName] = useState(initialCity)

  function findSelectedCityIndexByName ({ selectedCity }) {
    setSelectedCityIndex(
      years.findIndex(({ city: name }) => name === selectedCity),
    )
  }

  function findSelectedCityNameByIndex ({ selectedIndex }) {
    setSelectedCityName(years[selectedIndex].city)
  }

  return (
    <Layout>
      <SEO title="Home"/>
      <AboutMeJumbotron jumbotron={jumbotron} location={location}/>
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
      <AboutMeLatestArticles latestArticlesData={latestArticlesData}/>
    </Layout>
  )
};

export const aboutMeData = graphql`
    query getAboutMeData {
        aboutMe: allMarkdownRemark(
            filter: { frontmatter: { key: { eq: "about-me" } } }
            sort: { frontmatter: {timeline: {years: { city: ASC }}}}
        ) {
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
                                        gatsbyImageData(width: 400, height: 400, layout: FIXED)
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
                                        gatsbyImageData(layout: FULL_WIDTH)
                                    }
                                }
                            }
                        }
                        latestArticles {
                            title
                            quote
                            author
                        }
                    }
                }
            }
        }
        citiesDetails: allMarkdownRemark(
            filter: { frontmatter: { key: { eq: "city" } } }
            sort: { frontmatter: {name: ASC }}
        ) {
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
`

AboutMe.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired,
  location: PropTypes.objectOf(PropTypes.object).isRequired,
};

AboutMe.defaultProps = {};

export default AboutMe;
