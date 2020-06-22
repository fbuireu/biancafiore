import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import { Highlight } from 'react-instantsearch-dom';

export const SimpleHit = article => <li className={`article-card__item ${article.content.isFeaturedArticle ? `--is-featured` : ``}`}>
  <article>
    <Link to={`/${article.language.toLowerCase()}/blog${article.fields.slug}`}>
      <h2>
        <Highlight attribute={`content.title`} hit={article} tagName={`mark`} />
      </h2>
      <p>
        <Highlight attribute={`${article.content.summary ? `content.summary` : `excerpt`}`} hit={article} tagName={`mark`} />
      </p>
    </Link>
  </article>
</li>;

SimpleHit.propTypes = {
  article: PropTypes.objectOf(PropTypes.object),
};

SimpleHit.defaultProps = {};

export default SimpleHit;