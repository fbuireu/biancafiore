import algoliasearch from 'algoliasearch/lite';
import PropTypes from 'prop-types';
import { InstantSearch } from 'react-instantsearch-dom';
import Filter from '../Filter/Filter';
import './AlgoliaWrapper.scss';

const SEARCH_CLIENT = algoliasearch(process.env.GATSBY_ALGOLIA_APP_ID, process.env.GATSBY_ALGOLIA_API_KEY);

const AlgoliaWrapper = ({ hitsComponent: HitsComponent, indexName, ...props }) => {
  return <section className={`wrapper algolia__wrapper`}>
    <InstantSearch searchClient={SEARCH_CLIENT} indexName={indexName}>
      <Filter defaultRefinement={indexName} {...props} />
      <HitsComponent />
    </InstantSearch>
  </section>;
};

AlgoliaWrapper.propTypes = {
  hitsComponent: PropTypes.string.isRequired,
  indexName: PropTypes.string.isRequired,
};

AlgoliaWrapper.defaultProps = {};

export default AlgoliaWrapper;