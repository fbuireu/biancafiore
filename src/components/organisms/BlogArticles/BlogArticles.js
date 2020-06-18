import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import { InstantSearch } from 'react-instantsearch-dom';
import ArticleHits from '../ArticleHits/ArticleHits';
import FilterHits from '../FilterHits/FilterHits';
import './BlogArticles.scss';

const SEARCH_CLIENT = algoliasearch(process.env.GATSBY_ALGOLIA_APP_ID, process.env.GATSBY_ALGOLIA_API_KEY);

const BlogArticles = () => <InstantSearch searchClient={SEARCH_CLIENT} indexName={process.env.GATSBY_ALGOLIA_INDEX_NAME}>
  <FilterHits />
  <ArticleHits />
</InstantSearch>;

BlogArticles.propTypes = {};

BlogArticles.defaultProps = {};

export default BlogArticles;