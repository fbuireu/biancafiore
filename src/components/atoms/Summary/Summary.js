import PropTypes from 'prop-types'
import './Summary.scss'
import React from 'react'

const Summary = ({ summary, classNames }) => <p
  className={classNames}>{summary}</p>

Summary.propTypes = {
  summary: PropTypes.string,
  classNames: PropTypes.string,
}

Summary.defaultProps = {}

export default Summary;