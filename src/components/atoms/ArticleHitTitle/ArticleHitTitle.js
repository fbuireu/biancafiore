import PropTypes from 'prop-types';
import React from 'react';
import { Highlight } from 'react-instantsearch-dom';
import './ArticleHitTitle.scss';

const ArticleHitTitle = ({ hit }) => <h2 className={`article-card__title`}>
  <Highlight attribute={`content.title`} hit={hit} tagName={`mark`} />
</h2>;

ArticleHitTitle.propTypes = {
  hit: PropTypes.objectOf(PropTypes.object),
};

ArticleHitTitle.defaultProps = {};

export default ArticleHitTitle;