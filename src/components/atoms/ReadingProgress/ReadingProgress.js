import PropTypes from 'prop-types';
import React from 'react';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import ArrowUp from '../../../assets/svg/arrow-up.svg';
import { useWindowSize } from '../../../utils/hooks/useWindowSize';
import './ReadingProgress.scss';

const ReadingProgress = ({ scroll, articleProperties }) => {
  let currentScroll = Math.abs(scroll);
  const { height: windowHeight } = useWindowSize();
  const { offsetTop: articleOffsetTop, offsetHeight: articleHeight } = articleProperties;
  const isArticleVisible = currentScroll >= articleOffsetTop;
  const currentProgress = isArticleVisible ? Math.round(
    (currentScroll - articleOffsetTop) / (articleHeight - windowHeight) * 100) : 0;

  const scrollToTop = () => {
    window.scroll({
      top: 0,
      behavior: `smooth`
    });
  };

  return <div className={`reading-progress ${isArticleVisible ? `--is-visible` : ``}`} onClick={scrollToTop}>
    <CircularProgressbarWithChildren className={`reading-progress__svg__wrapper`} value={currentProgress}>
      <ArrowUp className={`arrow-up`} />
    </CircularProgressbarWithChildren>
  </div>;
};

ReadingProgress.propTypes = {
  scroll: PropTypes.number.isRequired,
  articleProperties: PropTypes.objectOf(PropTypes.object).isRequired,
};

ReadingProgress.defaultProps = {};

export default ReadingProgress;