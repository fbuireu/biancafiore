import RheostatRangeSlider from 'instantsearch-rheostat-range-slider-react';
import React from 'react';
import './Range.scss';

const Range = () => {
  return <div className={`filter__refinement-list --is-range-input`}>
    <p className={`filter__refinement-summary`}>Reading Time</p>
    <RheostatRangeSlider attribute={`content.readingTime`}/>
  </div>;
};

Range.propTypes = {};

Range.defaultProps = {};

export default Range;