import { GatsbyImage } from 'gatsby-plugin-image'
import Markdown from 'markdown-to-jsx'
import PropTypes from 'prop-types'
import Tilt from 'react-parallax-tilt'
import './HomeJumbotron.scss'
import React from 'react'

const HomeJumbotron = ({
  welcomeTextLeft,
  welcomeTextRight,
  welcomeDescription,
  welcomeImage: bianca,
}) => (
  <section className={`home__jumbotron__wrapper wrapper`}>
    <div className={`home__jumbotron__text-left`}>
      <Markdown className={`home__jumbotron__text-left__header`}
                options={{ wrapper: `h2`, forceWrapper: true }}>
        {welcomeTextLeft}
      </Markdown>
    </div>
    <div className={`home__jumbotron__text-center`}>
      <Tilt gyroscope={true} tiltMaxAngleX={3} tiltMaxAngleY={5}>
        <GatsbyImage image={bianca?.childImageSharp?.gatsbyImageData}/>
      </Tilt>
    </div>
    <div className={`home__jumbotron__text-right`}>
      <Markdown className={`home__jumbotron__text-right__header`}
                options={{ wrapper: `h2`, forceWrapper: true }}>
        {welcomeTextRight}
      </Markdown>
      <Markdown className={`home__jumbotron__text-right__body`}>{welcomeDescription}</Markdown>
    </div>
  </section>
);

HomeJumbotron.propTypes = {
  welcomeTextLeft: PropTypes.arrayOf(String).isRequired,
  welcomeTextRight: PropTypes.arrayOf(String).isRequired,
  welcomeDescription: PropTypes.arrayOf(String).isRequired,
  welcomeImage: PropTypes.arrayOf(String).isRequired
};

HomeJumbotron.defaultProps = {};

export default HomeJumbotron;
