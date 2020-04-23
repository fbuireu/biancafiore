import PropTypes from 'prop-types';
import React from 'react';
import Map from '../components/organisms/Map/Map';
import SEO from '../components/organisms/SEO/SEO';
import Layout from '../components/templates/Layout/Layout';

const AboutMe = props => {

  return <Layout>
    <SEO title="Home" />
    <h1>Hi About page</h1>
    <p>This will be an amazing portfolio for the best content writer ever.</p>
    <p>Now go build something great.</p>
    <Map />
  </Layout>;
};

// export const AboutMeData = graphql`
//     query getAboutMeData($slug: String!, $author: String) {
// #        about-me: markDownRemark
//     }
// `;

AboutMe.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired,
};

AboutMe.defaultProps = {};

export default AboutMe;
