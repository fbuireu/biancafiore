import PropTypes from 'prop-types';
import React from 'react';
import Clock from '../../../assets/svg/clock.svg';
import './ReadingTime.scss';

const ReadingTime = ({ readingTime,classNames }) => <div className={classNames}><Clock /><span>{readingTime} min</span></div>;

ReadingTime.propTypes = {
  readingTime: PropTypes.number.isRequired,
  classNames: PropTypes.string.isRequired,
};

ReadingTime.defaultProps = {};

export default ReadingTime;