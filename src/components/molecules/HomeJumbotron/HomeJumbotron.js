import Img from 'gatsby-image';
import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import React from 'react';
import Tilt from 'react-parallax-tilt';
import './HomeJumbotron.scss';

const HomeJumbotron = ({ jumbotron: { welcomeTextLeft, welcomeTextRight, welcomeDescription, welcomeImage: bianca } }) => (
  <section className={`jumbotron__wrapper wrapper`}>
    <div className={`jumbotron__text-left`}>
      <Markdown className={`jumbotron__text-left__header`}>{welcomeTextLeft}</Markdown>
    </div>
    <div className={`jumbotron__text-center`}>
      <Tilt gyroscope={true} tiltMaxAngleX={3} tiltMaxAngleY={5}>
        <Img fixed={bianca?.childImageSharp?.fixed} />
      </Tilt>
    </div>
    <div className={`jumbotron__text-right`}>
      <Markdown className={`jumbotron__text-right__header`}>{welcomeTextRight}</Markdown>
      <Markdown className={`jumbotron__text-right__body`}>{welcomeDescription}</Markdown>
    </div>
  </section>
);

HomeJumbotron.propTypes = {
  jumbotron: PropTypes.arrayOf(String).isRequired
};

HomeJumbotron.defaultProps = {};

export default HomeJumbotron;
