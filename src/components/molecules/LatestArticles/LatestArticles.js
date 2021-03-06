import PropTypes from 'prop-types';
import React from 'react';

const LatestArticles = ({ latestArticles }) => {
  return <section className={`jumbotron__wrapper wrapper`}>

  </section>;
};

LatestArticles.propTypes = {
  latestArticles: PropTypes.arrayOf(String).isRequired
};

LatestArticles.defaultProps = {};

export default LatestArticles;
