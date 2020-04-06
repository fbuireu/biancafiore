import PropTypes from 'prop-types';
import React from 'react';
import Subtitle from '../../atoms/Subtitle/Subtitle';
import Title from '../../atoms/Title/Title';
import './Billboard.scss';

const Billboard = ({ frontmatter }) => <section className={`billboard`}>
  <div className={`wrapper`}>
    <div className={`article-information`}>
      <Title title={frontmatter.content.title} />
      <Subtitle subtitle={frontmatter.content.subtitle} />
    </div>
  </div>
</section>;

Billboard.propTypes = {
  frontmatter: PropTypes.object,
};

Billboard.defaultProps = {};

export default Billboard;