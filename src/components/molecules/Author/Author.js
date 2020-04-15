import Img from 'gatsby-image';
import PropTypes from 'prop-types';
import React from 'react';

export const Author = ({ author, tags }) => {
  return <div>
    <Img className={``}
         fluid={author.frontmatter.image.childImageSharp.fluid}
         alt={author.frontmatter.name} />
  </div>;
};

Author.propTypes = {
  author: PropTypes.objectOf(PropTypes.object),
  tags: PropTypes.arrayOf(PropTypes.string),
};

Author.defaultProps = {
  tags: [],
};

export default Author;