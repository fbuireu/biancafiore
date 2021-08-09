import { connectStateResults } from 'react-instantsearch-dom';
import { ArticleHitCard } from '../ArticleHitCard/ArticleHitCard';
import './ArticleHitCards.scss';

const ArticleHitCards = () => {
  const FilterResults = connectStateResults(
    ({ searchResults, children }) => searchResults && searchResults.nbHits !== 0
      ? children
      : <p className={`filter__results --no-results-found`}>{`Blimey! You're so picky that not even a genie could find what you're looking for. Try to expand your search.`}</p>,
  );

  return <div className={`filter__results`}>
    <FilterResults>
      <ArticleHitCard />
    </FilterResults>
  </div>;
};

ArticleHitCards.propTypes = {};

ArticleHitCards.defaultProps = {};

export default ArticleHitCards;