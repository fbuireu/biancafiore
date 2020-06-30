import React from 'react';
import { SortBy } from 'react-instantsearch-dom';
import FilterClearRefinements from '../../molecules/FilterClearRefinements/FilterClearRefinements';
import FilterRange from '../../molecules/FilterRange/FilterRange';
import FilterRefinementList from '../../molecules/FilterRefinementList/FilterRefinementList';
import FilterSearch from '../../molecules/FilterSearch/FilterSearch';
import FilterStats from '../../molecules/FilterStats/FilterStats';
import './FilterHits.scss';

const FilterHits = () => {
  const SEARCH_PARAMETERS = [
    {
      label: `Tags`,
      attribute: `content.tags`,
      operator: `and`,
    },
    {
      label: `Authors`,
      attribute: `author`,
      operator: `or`,
    },
  ];

  return <aside className={`filter__wrapper`}>
    <p className={`filter__title`}>Filters</p>
    <FilterSearch />
    <FilterStats />
    <SortBy defaultRefinement={`Articles`}
            items={[
              { value: `content.readingTime_asc`, label: `Reading Time Asc` },
              { value: `content.readingTime_desc`, label: `Reading Time Desc` },
              { value: `content.isFeaturedArticle`, label: `Featured` },
            ]} />
    <FilterClearRefinements />
    {SEARCH_PARAMETERS.map(searchParameter => <FilterRefinementList key={searchParameter.label} {...searchParameter} />)}
    <FilterRange />
  </aside>;
};

FilterHits.propTypes = {};

FilterHits.defaultProps = {};

export default FilterHits;