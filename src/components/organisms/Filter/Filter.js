import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import { InstantSearch } from 'react-instantsearch-dom';
import FilterClearRefinements from '../../molecules/FilterClearRefinements/FilterClearRefinements';
import FilterRange from '../../molecules/FilterRange/FilterRange';
import FilterRefinementList from '../../molecules/FilterRefinementList/FilterRefinementList';
import FilterSearch from '../../molecules/FilterSearch/FilterSearch';
import FilterStats from '../../molecules/FilterStats/FilterStats';
import FilterHits from '../FilterHits/FilterHits';
import './Filter.scss';

const SEARCH_CLIENT = algoliasearch(process.env.GATSBY_ALGOLIA_APP_ID, process.env.GATSBY_ALGOLIA_API_KEY);

const Filter = () => {
  const SEARCH_PARAMETERS = [
    {
      label: `Tags`,
      attribute: `content.tags`,
      operator: `and`,
    },
    {
      label: `Author`,
      attribute: `author`,
      operator: `or`,
    },
  ];

  return <InstantSearch searchClient={SEARCH_CLIENT} indexName={process.env.GATSBY_ALGOLIA_INDEX_NAME}>
    <aside className={`filter__wrapper`}>
      <p className={`filter__title`}>Filters</p>
      <FilterSearch />
      <FilterStats />
      {/*<SortBy defaultRefinement={`Articles`}*/}
      {/*        items={[*/}
      {/*          { value: `author_asc`, label: `Author` },*/}
      {/*          { value: `language`, label: `Language` },*/}
      {/*        ]} />*/}
      <FilterClearRefinements />
      {SEARCH_PARAMETERS.map(
        searchParameter => <FilterRefinementList key={searchParameter.label} {...searchParameter} />)}
      <FilterRange />
    </aside>
    <FilterHits />
  </InstantSearch>;
};
Filter.propTypes = {};

Filter.defaultProps = {};

export default Filter;