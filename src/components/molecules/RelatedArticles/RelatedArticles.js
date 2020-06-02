import PropTypes from 'prop-types';
import React from 'react';
import ArticleCard from '../../atoms/ArticleCard/ArticleCard';
import './RelatedArticles.scss';

export const RelatedArticles = ({ relatedArticles }) => <section className={`related-articles__wrapper`}>
  <h3>Related Articles</h3>
  <ul className={`related-articles__list`}>
    {relatedArticles.map(({ node: relatedArticle }, index) => <li key={index}><ArticleCard article={relatedArticle} /></li>)}
  </ul>
</section>;

RelatedArticles.propTypes = {
  relatedArticles: PropTypes.arrayOf(PropTypes.object),
};

RelatedArticles.defaultProps = {};

export default RelatedArticles;