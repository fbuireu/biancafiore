import { GatsbyImage } from 'gatsby-plugin-image'
import Markdown from 'markdown-to-jsx'
import PropTypes from 'prop-types'
import './TimelineCity.scss'
import React from 'react'

const TimelineCity = ({ year, city, description, image, isActive }) => {
  return (
    <article className={`timeline-city ${isActive ? `--is-active` : ``}`}>
      <h3 className={`timeline-city__year`}>{year}</h3>
      <GatsbyImage
        image={image?.childImageSharp?.gatsbyImageData}
        className={`timeline-city__image`}
        alt={city}/>
      <h4 className={`timeline-city__name`}>{city}</h4>
      <Markdown
        className={`timeline-city__description`}>{description}</Markdown>
    </article>
  )
}

TimelineCity.propTypes = {
  year: PropTypes.string.isRequired,
  city: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.objectOf(PropTypes.object).isRequired,
  isActive: PropTypes.bool
};

TimelineCity.defaultProps = {};

export default TimelineCity;
