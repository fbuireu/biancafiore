import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { IntlContextConsumer } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import slugify from 'slugify';
import './Author.scss';

export const Author = ({ author }) => {
  return <section className={`author__wrapper`}>
    <div className={`author`}>
      <IntlContextConsumer>
        {({ language: currentLanguage }) =>
          <Link to={`/${currentLanguage}/tag/${slugify(author.frontmatter.name, { lower: true })}`}>
            <Img className={`author__image`}
                 fluid={author.frontmatter.image.childImageSharp.fluid}
                 alt={author.frontmatter.name}/>
          </Link>
        }
      </IntlContextConsumer>
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