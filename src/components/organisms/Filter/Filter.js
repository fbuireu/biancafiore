import PropTypes from 'prop-types';
import React from 'react';
import { RangeSlider } from '../../molecules/RangeSlider/RangeSlider';
import RefinementsList from '../../molecules/RefinementsList/RefinementsList';
import { SortHitsBy } from '../../molecules/SortHitsBy/SortHitsBy';
import { Search } from '../Search/Search';
import './Filter.scss';

const Filter = ({ filterParameters, defaultRefinement, hasRange }) => {
  return <aside className={`filters__wrapper`}>
    <Search />
    <SortHitsBy defaultRefinement={defaultRefinement}
                items={filterParameters.SORT_BY} />
    {filterParameters.SEARCH_PARAMETERS.map(searchParameter => <RefinementsList key={searchParameter.label} {...searchParameter} />)}
    {hasRange && <RangeSlider  attribute="content.readingTime"/>}
  </aside>;
};

Filter.propTypes = {
  filterParameters: PropTypes.array.isRequired,
  defaultRefinement: PropTypes.string.isRequired,
  hasRange: PropTypes.bool.isRequired
};

Filter.defaultProps = {};

export default Filter;