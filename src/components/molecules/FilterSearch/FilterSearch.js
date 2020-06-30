import React from 'react';
import { SearchBox } from 'react-instantsearch-dom';
import Close from '../../../assets/svg/close.svg';
import Search from '../../../assets/svg/search.svg';
import './FilterSearch.scss';

const FilterSearch = () => <div className={`filter__search-box`}>
  <SearchBox submit={<Search />}
             reset={<Close />}
             translations={{
               submitTitle: `Submit your search query.`,
               resetTitle: `Clear your search query.`,
               placeholder: `Find everything but Nemo.`,
             }} />
</div>;

FilterSearch.propTypes = {};

FilterSearch.defaultProps = {};

export default FilterSearch;
