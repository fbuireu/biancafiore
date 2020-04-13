import PropTypes from 'prop-types';
import React from 'react';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import ArrowUp from '../../../assets/svg/arrow-up.svg';
import { useWindowSize } from '../../../hooks/useWindowSize';
import './ReadingProgress.scss';

export const ReadingProgress = ({ scroll, articleProperties }) => {
  let currentScroll = Math.abs(scroll),
    { height: windowHeight } = useWindowSize(),
    { offsetTop: articleOffsetTop, offsetHeight: articleHeight } = articleProperties,
    isArticleVisible = currentScroll >= articleOffsetTop,
    currentProgress = isArticleVisible ? Math.round((currentScroll - articleOffsetTop) / (articleHeight - windowHeight) * 100) : 0;

  const scrollToTop = () => {
    window.scroll({
      top: 0,
      behavior: `smooth`,
    });
  };

  return <div className={`reading-progress ${isArticleVisible ? `--is-visible` : ``}`} onClick={scrollToTop}>
    <CircularProgressbarWithChildren className={`reading-progress__inner`} value={currentProgress}>
      <ArrowUp className={`arrow-up`} />
    </CircularProgressbarWithChildren>
  </div>;
};

ReadingProgress.propTypes = {
  scroll: PropTypes.number,
  articleProperties: PropTypes.object,
};

ReadingProgress.defaultProps = {};

export default ReadingProgress;