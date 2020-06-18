import React from 'react';
import { connectStateResults } from 'react-instantsearch-dom';
import { ArticleHit } from '../../molecules/Hit/Hit';
import './ArticleHits.scss';

const ArticleHits = () => {
  const FilterResults = connectStateResults(
    ({ searchResults, children }) => searchResults && searchResults.nbHits !== 0
      ? children
      : <p>{`Blimey! You're so picky that not even a genie could find what you're looking for. Try to expand your search.`}</p>,
  );

  return <div className={`filter__results`}>
    <FilterResults>
      <ArticleHit />
    </FilterResults>
  </div>;
};

ArticleHits.propTypes = {};

ArticleHits.defaultProps = {};

export default ArticleHits;