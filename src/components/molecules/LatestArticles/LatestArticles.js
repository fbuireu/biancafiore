import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import React from 'react';
import { useLatestArticles } from '../../../utils/hooks/useLatestArticles';
import LatestArticleCard from '../../atoms/LatestArticleCard/LatestArticleCard';
import './LatestArticles.scss';

const LatestArticles = ({ title }) => {
  const latestArticles = useLatestArticles();

  return <section className={`latest-articles__wrapper`}>
    <div className={`wrapper`}>
      <Markdown className={`latest-articles__title`} options={{ wrapper: `h2` }}>{title}</Markdown>
      <ul className={`latest-articles__list`}>
        {latestArticles.map(({ node: article }) => (
          <LatestArticleCard key={article.frontmatter.content.title} {...article} />
        ))}
      </ul>
    </div>
  </section>;
};

LatestArticles.propTypes = {
  title: PropTypes.string.isRequired
};

LatestArticles.defaultProps = {};

export default LatestArticles;
