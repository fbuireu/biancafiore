import algoliasearch from 'algoliasearch/lite';
import PropTypes from 'prop-types';
import React from 'react';
import { InstantSearch } from 'react-instantsearch-dom';
import Filter from '../Filter/Filter';
import './AlgoliaWrapper.scss';

const SEARCH_CLIENT = algoliasearch(process.env.GATSBY_ALGOLIA_APP_ID, process.env.GATSBY_ALGOLIA_API_KEY);

const AlgoliaWrapper = ({ hitsComponent: HitsComponent, indexName, filterParameters, hasRange }) => {
  return <InstantSearch searchClient={SEARCH_CLIENT} indexName={indexName}>
    <Filter filterParameters={filterParameters} defaultRefinement={indexName} hasRange={hasRange} />
    <HitsComponent />
  </InstantSearch>;
};

AlgoliaWrapper.propTypes = {
  hitsComponent: PropTypes.string.isRequired,
  indexName: PropTypes.string.isRequired,
  filterParameters: PropTypes.array.isRequired,
  hasRange: PropTypes.bool.isRequired
};

AlgoliaWrapper.defaultProps = {};

export default AlgoliaWrapper;