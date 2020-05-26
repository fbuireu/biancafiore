import PropTypes from 'prop-types';
import React from 'react';
import ReadingTime from '../../atoms/ReadingTime/ReadingTime';
import Subtitle from '../../atoms/Subtitle/Subtitle';
import Summary from '../../atoms/Summary/Summary';
import Tag from '../../atoms/Tag/Tag';
import Title from '../../atoms/Title/Title';
import './Billboard.scss';

const Billboard = ({ frontmatter, author, tags, excerpt }) => {
  let summary = frontmatter.content.summary || excerpt;

  return <section className={`billboard`}>
    <div className={`wrapper article-information`}>
      <Title title={frontmatter.content.title} />
      <Subtitle author={author.frontmatter.name} lastUpdated={frontmatter.content.lastUpdated} />
      <Summary summary={summary} />
      <ReadingTime readingTime={frontmatter.content.readingTime} />
      <Tag tags={tags} />
    </div>
  </section>;
};

Billboard.propTypes = {
  frontmatter: PropTypes.object.isRequired,
  author: PropTypes.objectOf(PropTypes.object).isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  excerpt: PropTypes.string,
};

Billboard.defaultProps = {};

export default Billboard;