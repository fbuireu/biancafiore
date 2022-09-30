import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import {
  PROJECTS_SEARCH_PARAMETERS,
} from '../../../utils/algolia/config/projectsSearchParameters'
import { PROJECTS_SORT_BY } from '../../../utils/algolia/config/projectsSortBy'
import {
  TAGS_SEARCH_PARAMETERS,
} from '../../../utils/algolia/config/tagsSearchParameters'
import { TAGS_SORT_BY } from '../../../utils/algolia/config/tagsSortBy'
import Breadcrumbs from '../../atoms/Breadcrumbs/Breadcrumbs'
import SEO from '../../atoms/SEO/SEO'
import AlgoliaWrapper from '../../organisms/AlgoliaWrapper/AlgoliaWrapper'
import ArticleHitCards from '../../organisms/ArticleHitCards/ArticleHitCards'
import ProjectHitCards from '../../organisms/ProjectHitCards/ProjectHitCards'
import Layout from '../Layout/Layout'
import './Tag.scss'

const CRITERIA = `criteria`

const Tag = ({ location, pageContext: { tag } }) => {
  const [queryStringCriteria, setQueryStringCriteria] = useState(null)
  const isProject = tag.key.toLowerCase().includes(`project`)

  const FILTER_PARAMETERS = {
    SEARCH_PARAMETERS: isProject
      ? PROJECTS_SEARCH_PARAMETERS
      : TAGS_SEARCH_PARAMETERS,
    SORT_BY: isProject ? PROJECTS_SORT_BY : TAGS_SORT_BY,
  }

  useEffect(() => {
    if (location?.search) {
      let criterias = new URLSearchParams(location.search).getAll(CRITERIA);

      criterias.forEach((criteria) => {
        let value = new URLSearchParams(location.search).get(criteria)
        setQueryStringCriteria((queryStringCriteria) => ({
          ...queryStringCriteria,
          [criteria]: value,
        }))
      })
    } else {
      setQueryStringCriteria({
        [tag.type]: tag.name,
      })
    }
  }, []);

  console.log(`queryStringCriteria`, queryStringCriteria)
  return (
    <Layout>
      <SEO title="Tag"/>
      <section className={`wrapper`}>
        <h1 className={`tag__title`}>
          Tag: <span className={`tag__name`}>{tag.name}</span>
        </h1>
        <Breadcrumbs location={location} classNames={`blog__jumbotron`}/>
        <AlgoliaWrapper
          hitsComponent={isProject ? ProjectHitCards : ArticleHitCards}
          indexName={
            isProject
              ? process.env.GATSBY_ALGOLIA_PROJECTS_INDEX_NAME
              : process.env.GATSBY_ALGOLIA_ARTICLES_INDEX_NAME
          }
          filterParameters={FILTER_PARAMETERS}
          hasRange={isProject}
          queryStringCriteria={queryStringCriteria}
        />
      </section>
    </Layout>
  )
};

Tag.propTypes = {
  location: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
};

Tag.defaultProps = {};

export default Tag;
