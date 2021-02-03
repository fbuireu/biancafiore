import Img from 'gatsby-image';
import PropTypes from 'prop-types';
import React from 'react';

const Testimonial = ({ author, quote, description, image }) => {
  return <div>{author}
    {quote}
    {description}
    <Img fluid={image.childImageSharp.fluid} />
  </div>;
};

Testimonial.propTypes = {
  author: PropTypes.string.isRequired,
  quote: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.objectOf(PropTypes.object).isRequired
};

Testimonial.defaultProps = {};

export default Testimonial;
