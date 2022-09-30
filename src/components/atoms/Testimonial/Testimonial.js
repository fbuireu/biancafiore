import { GatsbyImage } from 'gatsby-plugin-image'
import Markdown from 'markdown-to-jsx'
import PropTypes from 'prop-types'
import Quotes from '../../../assets/svg-components/quotes.svg'
import './Testimonial.scss'
import React from 'react'

const Testimonial = ({ author, quote, description, image, isActive }) => {
  return (
    <article className={`testimonial ${isActive ? `--is-active` : ``}`}>
      <GatsbyImage
        image={image?.childImageSharp?.gatsbyImageData}
        className={`testimonial__image`}
        alt={author}/>
      <Quotes className={`testimonial__quote`}/>
      <Markdown className={`testimonial__body`}>{quote}</Markdown>
      <div className={`testimonial__footer`}>
        <p className={`testimonial__author`}>{author}</p>
        <p className={`testimonial__description`}>{description}</p>
      </div>
    </article>
  );
};

Testimonial.propTypes = {
  author: PropTypes.string.isRequired,
  quote: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.objectOf(PropTypes.object).isRequired,
  isActive: PropTypes.bool
};

Testimonial.defaultProps = {};

export default Testimonial;
