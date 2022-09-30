import PropTypes from 'prop-types'
import './Title.scss'
import React from 'react'

const Title = ({ title }) => <h1 className={`article__title`}>{title}</h1>

Title.propTypes = {
  title: PropTypes.string.isRequired,
}

Title.defaultProps = {}

export default Title
