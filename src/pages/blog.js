import React from 'react';
import SEO from '../components/atoms/SEO/SEO';
import AlgoliaWrapper from '../components/organisms/AlgoliaWrapper/AlgoliaWrapper';
import ArticleHitCards from '../components/organisms/ArticleHitCards/ArticleHitCards';
import Layout from '../components/templates/Layout/Layout';
import { ARTICLES_SEARCH_PARAMETERS } from '../utils/algolia/config/articlesSearchParameters';
import { ARTICLES_SORT_BY } from '../utils/algolia/config/articlesSortBy';

const Blog = () => {
  const FILTER_PARAMETERS = {
    SEARCH_PARAMETERS: ARTICLES_SEARCH_PARAMETERS,
    SORT_BY: ARTICLES_SORT_BY
  };

  return <Layout>
    <SEO title="Blog" />
    <section className={`wrapper`}>
      <AlgoliaWrapper hitsComponent={ArticleHitCards}
                      indexName={process.env.GATSBY_ALGOLIA_ARTICLES_INDEX_NAME}
                      filterParameters={FILTER_PARAMETERS}
                      hasRange={true} />
    </section>
  </Layout>;
};

Blog.propTypes = {};

Blog.defaultProps = {};

export default Blog;