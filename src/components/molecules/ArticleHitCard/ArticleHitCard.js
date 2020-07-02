import PropTypes from 'prop-types';
import React from 'react';
import { connectHits } from 'react-instantsearch-dom';
import FeaturedImageArticleCard from '../../organisms/FeaturedImageArticleCard/FeaturedImageArticleCard';
import SimpleArticleCard from '../../organisms/SimpleArticleCard/SimpleArticleCard';
import './ArticleHitCard.scss';

export const Hit = ({ hits: articles }) => {
  return <ul className={`article-card__list`}>
    {articles.map(article => article.content.featuredImage
      ? <FeaturedImageArticleCard key={article.content.title} {...article} />
      : <SimpleArticleCard key={article.content.title} {...article} />,
    )}
  </ul>;
};

Hit.propTypes = {
  hits: PropTypes.objectOf(PropTypes.object),
};

Hit.defaultProps = {};

export const ArticleHitCard = connectHits(Hit);

