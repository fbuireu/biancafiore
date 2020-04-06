import PropTypes from 'prop-types';
import React from 'react';
import './Title.scss';

const Title = ({ title, classNames = `` }) => <h1 className={`title ${classNames}`}>{title}</h1>;

Title.propTypes = {
  title: PropTypes.string,
  classNames: PropTypes.classNames,
};

Title.defaultProps = {};

export default Title;