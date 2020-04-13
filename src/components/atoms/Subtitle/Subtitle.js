import PropTypes from 'prop-types';
import React from 'react';
import './Subtitle.scss';

const Subtitle = ({ lastUpdated, author }) => <p className={`subtitle`}>
  <time dateTime={lastUpdated}>{lastUpdated}</time>
  | <span className={`author`}>{author}</span>
</p>;

Subtitle.propTypes = {
  lastUpdated: PropTypes.string,
  author: PropTypes.string,
};

Subtitle.defaultProps = {};

export default Subtitle;