import { Link } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image'
import Markdown from 'markdown-to-jsx'
import PropTypes from 'prop-types'
import {
  useSocialNetworkItems,
} from '../../../utils/hooks/useSocialNetworkItems'
import Breadcrumbs from '../../atoms/Breadcrumbs/Breadcrumbs'
import './AboutMeJumbotron.scss'
import React from 'react'

const AboutMeJumbotron = ({
  location,
  jumbotron: {
    leftSide: { title, welcomeText, welcomeDescription, cta },
    rightSide: { image: bianca, socialNetworks },
  },
}) => {
  const allSocialNetworkItems = useSocialNetworkItems();

  let availableSocialNetworks = { names: [], urls: [] };

  allSocialNetworkItems.map(({ node: socialNetworkItem }) => {
    let {
      frontmatter: { name, url },
    } = socialNetworkItem

    if (socialNetworks.includes(name)) {
      availableSocialNetworks.names.push(name)
      availableSocialNetworks.urls.push(url)
    }

    return availableSocialNetworks
  });

  return (
    <section className={`about-me__jumbotron__wrapper wrapper`}>
      <h1 className={`about-me__jumbotron__title`}>{title}</h1>
      <Breadcrumbs classNames={`about-me__jumbotron`} location={location}/>
      <Markdown className={`about-me__jumbotron__header`}>
        {welcomeText}
      </Markdown>
      <Markdown className={`about-me__jumbotron__description`}>
        {welcomeDescription}
      </Markdown>
      <Link className={`about-me__jumbotron__cta`} to={`/blog`}>
        {cta}
      </Link>
      <GatsbyImage
        image={bianca?.childImageSharp?.gatsbyImageData}
        className={`about-me__jumbotron__image`}
      />
      <ul className={`about-me__jumbotron__social-networks__list`}>
        {availableSocialNetworks.urls.map((url, index) => {
          let name = availableSocialNetworks.names[index]

          return (
            <li
              key={name}
              className={`about-me__jumbotron__social-network__item`}
            >
              <a
                className={`about-me__jumbotron__social-network__link`}
                href={url}
                target={`_blank`}
                rel={`noopener noreferer`}
              >
                {name}
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  );
};

AboutMeJumbotron.propTypes = {
  jumbotron: PropTypes.arrayOf(String).isRequired,
  location: PropTypes.arrayOf(String),
};

AboutMeJumbotron.defaultProps = {};

export default AboutMeJumbotron;
