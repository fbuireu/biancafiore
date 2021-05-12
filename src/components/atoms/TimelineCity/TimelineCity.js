import Img from 'gatsby-image';
import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import React from 'react';
import './TimelineCity.scss';

const TimelineCity = ({ year, city, description, image, isActive }) => {
  return <article className={`timeline-city ${isActive ? `--is-active` : ``}`}>
    <h3 className={`timeline-city__year`}>{year}</h3>
    <Img fluid={image?.childImageSharp?.fluid}
         className={`timeline-city__image`}
         alt={city}
    />
    <h4 className={`timeline-city__name`}>{city}</h4>
    <Markdown className={`timeline-city__description`}>{description}</Markdown>
  </article>;
};

TimelineCity.propTypes = {
  year: PropTypes.string.isRequired,
  city: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.objectOf(PropTypes.object).isRequired,
  isActive: PropTypes.bool
};

TimelineCity.defaultProps = {};

export default TimelineCity;
