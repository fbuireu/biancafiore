import PropTypes from 'prop-types';
import React from 'react';
import Clock from '../../../assets/svg/clock.svg';
import './ReadingTime.scss';

const ReadingTime = ({ readingTime }) => <div className={`reading-time`}><Clock /><span>{readingTime} min</span></div>;

ReadingTime.propTypes = {
  readingTime: PropTypes.number,
};

ReadingTime.defaultProps = {};

export default ReadingTime;