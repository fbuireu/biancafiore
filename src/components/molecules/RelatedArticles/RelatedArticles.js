import PropTypes from 'prop-types';
import React from 'react';
import ArticleCard from '../../atoms/ArticleCard/ArticleCard';
import './RelatedArticles.scss';

export const RelatedArticles = ({ relatedArticles }) => <section className={`related-articles__wrapper`}>
  <h3>Related Articles</h3>
  <ul className={`related-articles__list`}>
    {relatedArticles.map(({ node: relatedArticle }, index) => <ArticleCard key={index} article={relatedArticle} />)}
  </ul>
</section>;

RelatedArticles.propTypes = {
  relatedArticles: PropTypes.arrayOf(PropTypes.object),
};

RelatedArticles.defaultProps = {};

export default RelatedArticles;