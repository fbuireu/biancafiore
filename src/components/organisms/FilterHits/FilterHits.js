import React from 'react';
import { connectStateResults, Hits } from 'react-instantsearch-dom';
import { Hit } from '../../molecules/Hit/Hit';

const FilterHits = () => {
  const FilterResults = connectStateResults(
    ({ searchState, searchResults, children }) =>
      searchResults && searchResults.nbHits !== 0
        ? children
        : <div>No results have been found for {searchState.query}.</div>,
  );

  return <div className={`filter__results`}>
    <FilterResults>
      <Hits hitComponent={Hit} />
    </FilterResults>
  </div>;
};

FilterHits.propTypes = {};

FilterHits.defaultProps = {};

export default FilterHits;