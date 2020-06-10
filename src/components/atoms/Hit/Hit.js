import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import { Highlight } from 'react-instantsearch-dom';

export const Hit = ({ hit: article }) => {
  console.log(article);
  return <article>
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
  </article>;
};

Hit.propTypes = {
  hit: PropTypes.objectOf(PropTypes.object),
};

Hit.defaultProps = {};

export default Hit;