import PropTypes from 'prop-types';
import React from 'react';
import './Title.scss';

const Title = ({ title }) => <h1 className={`title`}>{title}</h1>;

Title.propTypes = {
  title: PropTypes.string.isRequired,
};

Title.defaultProps = {};

export default Title;