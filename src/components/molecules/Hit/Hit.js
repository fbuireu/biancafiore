import PropTypes from 'prop-types';
import React from 'react';
import { connectHits } from 'react-instantsearch-dom';
import FeaturedImageHit from '../../organisms/FeaturedImageHit/FeaturedImageHit';
import SimpleHit from '../../organisms/SimpleHit/SimpleHit';
import './Hit.scss';

export const Hit = ({ hits: articles }) => {
  return <ul className={`article-card__list`}>
    {articles.map(article => article.content.featuredImage
      ? <FeaturedImageHit key={article.content.title} {...article} />
      : <SimpleHit key={article.content.title} {...article} />,
    )}
  </ul>;
};

Hit.propTypes = {
  hits: PropTypes.objectOf(PropTypes.object),
};

Hit.defaultProps = {};

export const ArticleHit = connectHits(Hit);

