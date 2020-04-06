import PropTypes from 'prop-types';
import React from 'react';
import './Subtitle.scss';

const Subtitle = ({ subtitle, classNames = `` }) => <h2 className={`subtitle ${classNames}`}>{subtitle}</h2>;

Subtitle.propTypes = {
  subtitle: PropTypes.string,
  classNames: PropTypes.classNames,
};

Subtitle.defaultProps = {};

export default Subtitle;