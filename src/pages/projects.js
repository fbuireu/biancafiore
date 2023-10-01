import PropTypes from 'prop-types';
import Breadcrumbs from '../components/atoms/Breadcrumbs/Breadcrumbs';
import SEO from '../components/atoms/SEO/SEO'
import AlgoliaWrapper
  from '../components/organisms/AlgoliaWrapper/AlgoliaWrapper'
import ProjectHitCards
  from '../components/organisms/ProjectHitCards/ProjectHitCards'
import Layout from '../components/templates/Layout/Layout'
import {
  PROJECTS_SEARCH_PARAMETERS,
} from '../utils/algolia/config/projectsSearchParameters'
import { PROJECTS_SORT_BY } from '../utils/algolia/config/projectsSortBy'
import React from 'react'

const FILTER_PARAMETERS = {
  SEARCH_PARAMETERS: PROJECTS_SEARCH_PARAMETERS,
  SORT_BY: PROJECTS_SORT_BY,
}

const Projects = ({location}) => {
  return (
    <Layout>
      <SEO title="Projects"/>
      <section className={`wrapper`}>
        <h1 className={`blog__jumbotron__title`}>Projects</h1>
        <Breadcrumbs location={location} />
        <AlgoliaWrapper
          hitsComponent={ProjectHitCards}
          indexName={process.env.GATSBY_ALGOLIA_PROJECTS_INDEX_NAME}
          filterParameters={FILTER_PARAMETERS}
          hasRange={false}
        />
      </section>
    </Layout>
  )
};

Projects.propTypes = {
  location: PropTypes.objectOf(PropTypes.object).isRequired,
};

Projects.defaultProps = {};

export default Projects;
