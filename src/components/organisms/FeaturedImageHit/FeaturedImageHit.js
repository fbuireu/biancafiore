import { Link } from 'gatsby';
import BackgroundImage from 'gatsby-background-image';
import PropTypes from 'prop-types';
import React from 'react';
import { Highlight } from 'react-instantsearch-dom';

export const FeaturedImageHit = article => <li className={`article-card__item`}>
  <article>
    <BackgroundImage className={`article-card__image`}
                     fluid={[
                       `linear-gradient(to bottom, transparent, #000)`,
                       article.content.featuredImage.childImageSharp.fluid]}>
      <Link to={`/${article.language.toLowerCase()}/blog${article.fields.slug}`}>
        <h2>
          <Highlight attribute={`content.title`} hit={article} tagName={`mark`} />
        </h2>
        <p>
          <Highlight attribute={`${article.content.summary ? `content.summary` : `excerpt`}`}
                     hit={article}
                     tagName={`mark`} />
        </p>
      </Link>
    </BackgroundImage>
  </article>
</li>;

FeaturedImageHit.propTypes = {
  article: PropTypes.objectOf(PropTypes.object),
};

FeaturedImageHit.defaultProps = {};

export default FeaturedImageHit;