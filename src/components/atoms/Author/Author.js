import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import slugify from 'slugify';
import './Author.scss';

export const Author = ({ author }) => {
  const { locale: currentLanguage } = useIntl();

  return <section className={`author__wrapper`}>
    <div className={`author`}>
      <Link to={`/${currentLanguage}/tag/${slugify(author.frontmatter.name, { lower: true })}`}>
        <Img className={`author__image`}
             fluid={author?.frontmatter?.image?.childImageSharp?.fluid}
             alt={author.frontmatter.name} />
      </Link>
      {author.frontmatter.description && <p className={`author__description`}>{author.frontmatter.description}</p>}
    </div>
  </section>;
};

Author.propTypes = {
  author: PropTypes.objectOf(PropTypes.object),
};

Author.defaultProps = {
  tags: [],
};

export default Author;