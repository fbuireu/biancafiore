import PropTypes from 'prop-types';
import React from 'react';
import { useWindowSize } from '../../../hooks/useWindowSize';
import './ReadingProgress.scss';

const ReadingProgress = ({ scroll, articleProperties }) => {
  let currentScroll = Math.abs(scroll),
    { height: windowHeight } = useWindowSize(),
    { offsetTop: articleOffsetTop, offsetHeight: articleHeight } = articleProperties,
    currentProgress = Math.round((currentScroll - articleOffsetTop) / (articleHeight - windowHeight) * 100);

  return <div className={`reading-progress ${currentScroll >= articleOffsetTop ? `--is-visible` : ``}`} style={{ width: `${currentProgress}vw` }} />;
};

ReadingProgress.propTypes = {
  scroll: PropTypes.number,
  articleProperties: PropTypes.object,
};

ReadingProgress.defaultProps = {};

export default ReadingProgress;