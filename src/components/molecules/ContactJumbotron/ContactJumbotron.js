import { GatsbyImage } from 'gatsby-plugin-image'
import Markdown from 'markdown-to-jsx'
import PropTypes from 'prop-types'
import Breadcrumbs from '../../atoms/Breadcrumbs/Breadcrumbs'
import './ContactJumbotron.scss'
import React from 'react'

const ContactJumbotron = ({
  jumbotron: { welcomeText, welcomeDescription, image },
  location,
}) => {
  return (
    <section className={`contact__jumbotron__wrapper wrapper`}>
      <Breadcrumbs classNames={`contact__jumbotron`} location={location}/>
      <h1 className={`contact__jumbotron__title`}>{welcomeText}</h1>
      <Markdown className={`contact__jumbotron__description`}>
        {welcomeDescription}
      </Markdown>
      <GatsbyImage
        image={image?.childImageSharp?.gatsbyImageData}
        className={`contact__jumbotron__image`}
      />
    </section>
  );
};

ContactJumbotron.propTypes = {
  jumbotron: PropTypes.arrayOf(String).isRequired,
  location: PropTypes.arrayOf(String),
};

ContactJumbotron.defaultProps = {};

export default ContactJumbotron;
