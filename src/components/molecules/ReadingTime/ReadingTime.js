import PropTypes from 'prop-types';
import React from 'react';
import Clock from '../../../assets/svg/clock.svg';
import './ReadingTime.scss';

const ReadingTime = () => <div className={`reading-time flex --row-wrap --align-center`}><Clock /><span>8 min</span></div>;

ReadingTime.propTypes = {
  frontmatter: PropTypes.object,
};

ReadingTime.defaultProps = {};

export default ReadingTime;