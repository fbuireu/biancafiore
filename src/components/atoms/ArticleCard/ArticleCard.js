import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import './ArticleCard.scss';

export const ArticleCard = ({ article }) => {
  let { excerpt, fields, frontmatter } = article,
    summary = frontmatter.content.summary || excerpt;

  return <li className={`article-card__item`}>
    <Link to={`/${frontmatter.language.toLowerCase()}/blog${fields.slug}`}>
      <article>
        <h4>{frontmatter.content.title}</h4>
        <p>{summary}</p>
      </article>
    </Link>
  </li>;
};

ArticleCard.propTypes = {
  article: PropTypes.objectOf(PropTypes.object),
};

ArticleCard.defaultProps = {};

export default ArticleCard;