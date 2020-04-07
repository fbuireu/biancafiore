import PropTypes from 'prop-types';
import React from 'react';
import './Summary.scss';

const Summary = ({ summary }) => <h2 className={`summary`}>{summary}</h2>;

Summary.propTypes = {
  summary: PropTypes.string,
};

Summary.defaultProps = {};

export default Summary;