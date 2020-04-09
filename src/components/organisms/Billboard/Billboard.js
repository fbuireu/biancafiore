import PropTypes from 'prop-types';
import React from 'react';
import Subtitle from '../../atoms/Subtitle/Subtitle';
import Summary from '../../atoms/Summary/Summary';
import Title from '../../atoms/Title/Title';
import ReadingTime from '../../molecules/ReadingTime/ReadingTime';
import './Billboard.scss';

const Billboard = ({ frontmatter }) => <section className={`billboard`}>
  <div className={`wrapper flex`}>
    <div className={`article-information flex --column-wrap --justify-center`}>
      <Title title={frontmatter.content.title} />
      <Subtitle author={frontmatter.seo.author} lastUpdated={frontmatter.content.lastUpdated} />
      <Summary summary={frontmatter.content.summary} />
      <ReadingTime />
    </div>
  </div>
</section>;

Billboard.propTypes = {
  frontmatter: PropTypes.object,
};

Billboard.defaultProps = {};

export default Billboard;