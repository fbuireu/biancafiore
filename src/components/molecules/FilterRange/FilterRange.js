import RheostatRangeSlider from 'instantsearch-rheostat-range-slider-react';
import React from 'react';

const FilterRange = () => <div className={`filter__refinement-list`}>
  <p>Reading Time</p>
  <RheostatRangeSlider attribute={`content.readingTime`} />
</div>;

FilterRange.propTypes = {};

FilterRange.defaultProps = {};

export default FilterRange;