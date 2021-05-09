import Img from 'gatsby-image';
import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import React from 'react';
import Quotes from '../../../assets/svg-components/quotes.svg';
import './Testimonial.scss';

const Testimonial = ({ author, quote, description, image, isActive }) => {
  return (
    <article className={`testimonial ${isActive ? `--is-active` : ``}`}>
      <Img fluid={image?.childImageSharp?.fluid}
           className={`testimonial__image`}
           alt={author} />
      <Quotes className={`testimonial__quote`} />
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
