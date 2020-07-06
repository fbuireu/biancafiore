import React from 'react';
import Range from '../../molecules/Range/Range';
import RefinementsList from '../../molecules/RefinementsList/RefinementsList';
import { SortHitsBy } from '../../molecules/SortHitsBy/SortHitsBy';
import { Search } from '../Search/Search';
import './Filter.scss';

const Filter = () => {
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
    ],
    SORT_BY_PARAMETERS = [
      { value: `content.isFeaturedArticle`, label: `Featured` },
      { value: `content.readingTime_asc`, label: `Reading Time (ascending ↑)` },
      { value: `content.readingTime_desc`, label: `Reading Time (descending ↓)` },
      { value: `content.lastUpdated_asc`, label: `Updated Date (ascending ↑)` },
      { value: `content.lastUpdated_desc`, label: `Updated Date (descending ↓)` },
    ];

  return <aside className={`filters__wrapper`}>
    <Search />
    <SortHitsBy defaultRefinement={process.env.GATSBY_ALGOLIA_INDEX_NAME} items={SORT_BY_PARAMETERS} />
    {SEARCH_PARAMETERS.map(searchParameter => <RefinementsList key={searchParameter.label} {...searchParameter} />)}
    <Range />
  </aside>;
};

Filter.propTypes = {};

Filter.defaultProps = {};

export default Filter;