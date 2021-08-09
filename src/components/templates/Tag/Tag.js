import { TAGS_SEARCH_PARAMETERS } from '../../../utils/algolia/config/tagsSearchParameters';
import { TAGS_SORT_BY } from '../../../utils/algolia/config/tagsSortBy';
import SEO from '../../atoms/SEO/SEO';
import AlgoliaWrapper from '../../organisms/AlgoliaWrapper/AlgoliaWrapper';
import ArticleHitCards from '../../organisms/ArticleHitCards/ArticleHitCards';
import Layout from '../Layout/Layout';

const Tag = props => {
  const FILTER_PARAMETERS = {
    SEARCH_PARAMETERS: TAGS_SEARCH_PARAMETERS,
    SORT_BY: TAGS_SORT_BY
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

Tag.propTypes = {};

Tag.defaultProps = {};

export default Tag;
