import PropTypes from 'prop-types'
import Breadcrumbs from '../../atoms/Breadcrumbs/Breadcrumbs'
import SEO from '../../atoms/SEO/SEO'
import Layout from '../Layout/Layout'
import React from 'react'

const Project = ({ location }) => {
  return (
    <Layout>
      <SEO title="Tag"/>
      <section className={`wrapper`}>
        <h1 className={`tag__title`}>
          <span className={`tag__name`}>HEHE</span>
        </h1>
        <Breadcrumbs location={location} classNames={`blog__jumbotron`}/>
      </section>
    </Layout>
  )
};

Project.propTypes = {
  location: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
};

Project.defaultProps = {};

export default Project;
