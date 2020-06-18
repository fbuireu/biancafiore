import React from 'react';
import { connectStateResults, Hits } from 'react-instantsearch-dom';
import Hit from '../../molecules/Hit/Hit';
import './ArticleHits.scss';

const ArticleHits = () => {
  const FilterResults = connectStateResults(
    ({ searchResults, children }) => searchResults && searchResults.nbHits !== 0
      ? children
      : <p>{`Blimey! You're so picky that not even a genie could find what you're looking for. Try to expand your search.`}</p>,
  );

  return <div className={`filter__results`}>
    <FilterResults>
      <Hits hitComponent={Hit} />
    </FilterResults>
  </div>;
};

ArticleHits.propTypes = {};

ArticleHits.defaultProps = {};

export default ArticleHits;