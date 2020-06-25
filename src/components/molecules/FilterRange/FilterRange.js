import RheostatRangeSlider from 'instantsearch-rheostat-range-slider-react';
import React from 'react';
import './FilterRange.scss';

const FilterRange = () => <div className={`filter__refinement-list`}>
  <p className={`filter__refinement-summary`}>Reading Time</p>
  <RheostatRangeSlider attribute={`content.readingTime`} />
</div>;

FilterRange.propTypes = {};

FilterRange.defaultProps = {};

export default FilterRange;