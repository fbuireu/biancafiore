import PropTypes from 'prop-types';
import React from 'react';
import { Highlight } from 'react-instantsearch-dom';
import './ArticleHitSummary.scss';

const ArticleHitSummary = ({ hit, article }) => <p className={`article-card__summary`}>
  <Highlight attribute={`${article.content.summary ? `content.summary` : `excerpt`}`}
             hit={hit}
             tagName={`mark`} />
</p>;

ArticleHitSummary.propTypes = {
  hit: PropTypes.objectOf(PropTypes.object),
  article: PropTypes.objectOf(PropTypes.object),
};

ArticleHitSummary.defaultProps = {};

export default ArticleHitSummary;

