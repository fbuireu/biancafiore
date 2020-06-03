import PropTypes from 'prop-types';
import React from 'react';
import ReadingTime from '../../atoms/ReadingTime/ReadingTime';
import Subtitle from '../../atoms/Subtitle/Subtitle';
import Summary from '../../atoms/Summary/Summary';
import Tag from '../../atoms/Tag/Tag';
import Title from '../../atoms/Title/Title';

const SimpleBillboard = ({ frontmatter, author, tags, excerpt }) => {
  let summary = frontmatter.content.summary || excerpt;

  return <section className={`billboard`}>
    <div className={`wrapper article__information__wrapper`}>
      <div className={`article__information`}>
        <Title title={frontmatter.content.title} />
        <Subtitle author={author.frontmatter.name} lastUpdated={frontmatter.content.lastUpdated} />
        <Summary summary={summary} />
        <ReadingTime readingTime={frontmatter.content.readingTime} />
        <Tag tags={tags} />
      </div>
    </div>
  </section>;
};

SimpleBillboard.propTypes = {
  frontmatter: PropTypes.object.isRequired,
  author: PropTypes.objectOf(PropTypes.object).isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  excerpt: PropTypes.string,
};

SimpleBillboard.defaultProps = {};

export default SimpleBillboard;