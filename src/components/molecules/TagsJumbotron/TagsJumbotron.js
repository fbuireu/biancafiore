import PropTypes from 'prop-types'
import Breadcrumbs from '../../atoms/Breadcrumbs/Breadcrumbs'
import './TagsJumbotron.scss'
import React from 'react'

const TagsJumbotron = ({ location }) => {
  return <>
    <h1 className={`tags__title`}>Tags Glossary</h1>
    <Breadcrumbs location={location} classNames={`tags__jumbotron`}/>
  </>
}

TagsJumbotron.propTypes = {
  location: PropTypes.objectOf(PropTypes.object).isRequired,
};

TagsJumbotron.defaultProps = {};

export default TagsJumbotron;