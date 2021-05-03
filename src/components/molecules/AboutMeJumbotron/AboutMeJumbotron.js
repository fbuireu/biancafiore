import { Link } from 'gatsby';
import Img from 'gatsby-image';
import PropTypes from 'prop-types';
import React from 'react';
import { useSocialNetworkItems } from '../../../utils/hooks/useSocialNetworkItems';
import './AboutMeJumbotron.scss';

const AboutMeJumbotron = ({
  jumbotron: {
    leftSide: {
      title,
      welcomeText,
      welcomeDescription,
      cta
    },
    rightSide: {
      image: bianca,
      socialNetworks
    }
  }
}) => {
  const allSocialNetworkItems = useSocialNetworkItems();
  let availableSocialNetworks = { names: [], urls: [] };

  allSocialNetworkItems.map(({ node: socialNetworkItem }) => {
    if (socialNetworks.includes(socialNetworkItem.frontmatter.name)) {
      availableSocialNetworks.names.push(socialNetworkItem.frontmatter.name);
      availableSocialNetworks.urls.push(socialNetworkItem.frontmatter.url);
    }

    return availableSocialNetworks;
  });

  return <section className={`wrapper`}>
    {title}
    {welcomeText}
    {welcomeDescription}
    {cta}

    <Img fixed={bianca?.childImageSharp?.fixed} />
    <ul>
      {availableSocialNetworks.urls.map((url, index) => {
        let name = availableSocialNetworks.names[index];

        return <li key={name}><Link to={url}>{name}</Link></li>;
      })}
    </ul>
  </section>;
};

AboutMeJumbotron.propTypes = {
  jumbotron: PropTypes.arrayOf(String).isRequired
};

AboutMeJumbotron.defaultProps = {};

export default AboutMeJumbotron;
