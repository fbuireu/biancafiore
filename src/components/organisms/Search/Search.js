import React from 'react';
import { SearchBox } from 'react-instantsearch-dom';
import Close from '../../../assets/svg/close.svg';
import Lens from '../../../assets/svg/search.svg';
import FilterStats from '../../molecules/FilterStats/FilterStats';
import './Search.scss';

const Search = () => <div className={`filter__search-box`}>
  <SearchBox submit={<Lens />}
             reset={<Close />}
             translations={{
               submitTitle: `Find everything but Nemo.`,
               resetTitle: `Everyone can make a mistake.`,
               placeholder: `Find everything but Nemo.`,
             }} />
  <FilterStats />
</div>;

Search.propTypes = {};

Search.defaultProps = {};

export default Search;
