import PropTypes from 'prop-types';
import React from 'react';
import { connectHits } from 'react-instantsearch-dom';
import FeaturedImageArticleCard from '../FeaturedImageArticleCard/FeaturedImageArticleCard';
import SimpleArticleCard from '../SimpleArticleCard/SimpleArticleCard';
import './ArticleHitCard.scss';

const CustomHit = ({ hits: articles }) => {
  return <ul className={`articles-card__list`}>
    {articles.map(article => article.content.featuredImage
      ? <FeaturedImageArticleCard key={article.content.title} {...article} />
      : <SimpleArticleCard key={article.content.title} {...article} />
    )}
  </ul>;
};

CustomHit.propTypes = {
  hits: PropTypes.objectOf(PropTypes.object),
};

CustomHit.defaultProps = {};

export const ArticleHitCard = connectHits(CustomHit);
