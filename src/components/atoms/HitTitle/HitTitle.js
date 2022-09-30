import PropTypes from 'prop-types'
import { Highlight } from 'react-instantsearch-dom'
import './HitTitle.scss'
import React from 'react'

const HitTitle = ({ hit, attribute }) => {
  return <h2 className={`hit-card__title`}>
    <Highlight attribute={attribute} hit={hit} tagName={`mark`}/>
  </h2>
}

HitTitle.propTypes = {
  hit: PropTypes.objectOf(PropTypes.object).isRequired,
  attribute: PropTypes.string.isRequired,
};

HitTitle.defaultProps = {};

export default HitTitle;