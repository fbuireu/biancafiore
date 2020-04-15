import PropTypes from 'prop-types';
import React from 'react';
import Subtitle from '../../atoms/Subtitle/Subtitle';
import Summary from '../../atoms/Summary/Summary';
import Title from '../../atoms/Title/Title';
import ReadingTime from '../../molecules/ReadingTime/ReadingTime';
import './Billboard.scss';

const Billboard = article => {
  const { frontmatter } = article;
  let summary = frontmatter.content.summary || article.excerpt;

  return <section className={`billboard`}>
    <div className={`wrapper article-information`}>
      <Title title={frontmatter.content.title} />
      <Subtitle author={article.author.frontmatter.name} lastUpdated={frontmatter.content.lastUpdated} />
      <Summary summary={summary} />
      <ReadingTime readingTime={frontmatter.content.readingTime} />
    </div>
  </section>;
};

Billboard.propTypes = {
  article: PropTypes.objectOf(PropTypes.string),
};

Billboard.defaultProps = {};

export default Billboard;