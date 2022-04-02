import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { TAGS_SEARCH_PARAMETERS } from '../../../utils/algolia/config/tagsSearchParameters';
import { TAGS_SORT_BY } from '../../../utils/algolia/config/tagsSortBy';
import Breadcrumbs from '../../atoms/Breadcrumbs/Breadcrumbs';
import SEO from '../../atoms/SEO/SEO';
import AlgoliaWrapper from '../../organisms/AlgoliaWrapper/AlgoliaWrapper';
import ArticleHitCards from '../../organisms/ArticleHitCards/ArticleHitCards';
import Layout from '../Layout/Layout';
import './Tag.scss';

const CRITERIA = `criteria`;

const FILTER_PARAMETERS = {
  SEARCH_PARAMETERS: TAGS_SEARCH_PARAMETERS,
  SORT_BY: TAGS_SORT_BY
};

const Tag = ({ location, pageContext: { tag } }) => {
  const [queryStringCriteria, setQueryStringCriteria] = useState(null);

  useEffect(() => {
    if (location?.search) {
      let criterias = new URLSearchParams(location.search).getAll(CRITERIA);

      criterias.forEach(criteria => {
        let value = new URLSearchParams(location.search).get(criteria);
        setQueryStringCriteria(queryStringCriteria => ({
          ...queryStringCriteria,
          [criteria]: value
        }));
      });
    } else {
      setQueryStringCriteria({
        [tag.type]: tag.name
      });
    }
  }, []);

  return <Layout>
    <SEO title="Tag" />
    <section className={`wrapper`}>
      <h1 className={`tag__title`}>Tag: <span className={`tag__name`}>{tag.name}</span></h1>
      <Breadcrumbs location={location} classNames={`blog__jumbotron`} />
      <AlgoliaWrapper
        hitsComponent={ArticleHitCards}
        indexName={process.env.GATSBY_ALGOLIA_ARTICLES_INDEX_NAME}
        filterParameters={FILTER_PARAMETERS}
        hasRange={true}
        queryStringCriteria={queryStringCriteria}
      />
    </section>
  </Layout>;
};

Tag.propTypes = {
  location: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired
};

Tag.defaultProps = {};

export default Tag;
