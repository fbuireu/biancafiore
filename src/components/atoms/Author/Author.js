import { Link } from 'gatsby';
import Img from 'gatsby-image';
import PropTypes from 'prop-types';
import React from 'react';
import slugify from 'slugify';
import './Author.scss';

export const Author = ({ author, tags }) => <section className={`author__wrapper`}>
  <div className={`author`}>
    <Link to={`/tag/${slugify(author.frontmatter.name, { lower: true })}`}>
      <Img className={`author__image`}
           fluid={author.frontmatter.image.childImageSharp.fluid}
           alt={author.frontmatter.name} />
    </Link>

    {author.frontmatter.description && <p className={`author__description`}>{author.frontmatter.description}</p>}
  </div>
  <ul className={`tags__list`}>
    {tags.map((tag, index) => <li className={`tag__item`} key={index}><Link to={`/tag/${slugify(tag, { lower: true })}`}>#{tag}</Link></li>)}
  </ul>
</section>;

Author.propTypes = {
  author: PropTypes.objectOf(PropTypes.object),
  tags: PropTypes.arrayOf(PropTypes.string),
};

Author.defaultProps = {
  tags: [],
};

export default Author;