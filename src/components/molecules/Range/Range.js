import RheostatRangeSlider from 'instantsearch-rheostat-range-slider-react';
import React from 'react';
import './Range.scss';

const Range = () => <div className={`filter__refinement-list`}>
  <p className={`filter__refinement-summary`}>Reading Time</p>
  <RheostatRangeSlider attribute={`content.readingTime`} />
</div>;

Range.propTypes = {};

Range.defaultProps = {};

export default Range;