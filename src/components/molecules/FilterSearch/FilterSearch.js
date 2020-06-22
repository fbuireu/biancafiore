import React from 'react';
import { SearchBox } from 'react-instantsearch-dom';

const FilterSearch = () => <div className={`filter__search-box`}>
  <SearchBox translations={{
    submitTitle: `Submit your search query.`,
    resetTitle: `Clear your search query.`,
    placeholder: `Find everything but Nemo.`,
  }} />
</div>;

FilterSearch.propTypes = {};

FilterSearch.defaultProps = {};

export default FilterSearch;
