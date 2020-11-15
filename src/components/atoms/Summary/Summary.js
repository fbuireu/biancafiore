import PropTypes from 'prop-types';
import React from 'react';
import './Summary.scss';

const Summary = ({ summary, classNames }) => <p className={classNames}>{summary}</p>;

Summary.propTypes = {
  summary: PropTypes.string,
  classNames: PropTypes.string,
};

Summary.defaultProps = {};

export default Summary;