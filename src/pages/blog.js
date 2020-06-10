import algoliasearch from 'algoliasearch/lite';
import PropTypes from 'prop-types';
import React from 'react';
import {
  CurrentRefinements,
  Hits,
  InstantSearch,
  RefinementList,
  SearchBox,
  SortBy,
  Stats,
} from 'react-instantsearch-dom';
import Hit from '../components/atoms/Hit/Hit';
import Seo from '../components/atoms/Seo/Seo';
import Layout from '../components/templates/Layout/Layout';

const SEARCH_CLIENT = algoliasearch(process.env.GATSBY_ALGOLIA_APP_ID, process.env.GATSBY_ALGOLIA_API_KEY);

//Todo: SortBy items

const Blog = () => <Layout>
  <Seo title="Blog" />
  <section className={`wrapper`}>
    <InstantSearch searchClient={SEARCH_CLIENT} indexName={process.env.GATSBY_ALGOLIA_INDEX_NAME}>
      <SearchBox />
      <Stats />
      {/*<SortBy defaultRefinement={`Articles`}*/}
      {/*        items={[*/}
      {/*          { value: `author_asc`, label: `Author` },*/}
      {/*          { value: `language`, label: `Language` },*/}
      {/*        ]} />*/}
      <div>
        Current Filters: <CurrentRefinements />
      </div>
      <div>
        Tags: <RefinementList attribute={`content.tags`}  />
      </div>
      <div>
        Author: <RefinementList attribute={`author`}  />
      </div>
      <div>
        Reading time: <RefinementList attribute={`content.readingTime`}  />
      </div>
      <Hits hitComponent={Hit} />
    </InstantSearch>
  </section>
</Layout>;

Blog.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired,
};

Blog.defaultProps = {};

export default Blog;
