import PropTypes from 'prop-types';
import React from 'react';
import './Summary.scss';

const Summary = ({ summary }) => <p className={`article__summary`}>{summary}</p>;

Summary.propTypes = {
  summary: PropTypes.string,
};

Summary.defaultProps = {};

export default Summary;