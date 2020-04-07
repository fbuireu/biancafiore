import PropTypes from 'prop-types';
import React from 'react';
import './Subtitle.scss';

const Subtitle = ({ lastUpdated, author }) => <p className={`subtitle`}>{lastUpdated} by {author}</p>;

Subtitle.propTypes = {
  lastUpdated: PropTypes.string,
  author: PropTypes.string,
};

Subtitle.defaultProps = {};

export default Subtitle;