import BackgroundImage from 'gatsby-background-image';
import PropTypes from 'prop-types';
import React from 'react';
import HitTitle from '../../atoms/HitTitle/HitTitle';
import Summary from '../../atoms/Summary/Summary';
import HitTags from '../../molecules/HitTags/HitTags';

export const FeaturedImageProjectCard = project => {
  return <li className={`hit-card__item`}>
    <article className={`hit-card__item__inner`}>
      <BackgroundImage className={`hit-card__image`}
                       fluid={[
                         `linear-gradient(rgba(0,0,0, .5), rgba(0, 0, 0, .8))`,
                         project.featuredImage.childImageSharp.fluid]}>
        <HitTitle hit={project} attribute={`title`} />
        <HitTags hit={project} attribute={`tags`} />
        {/*<Summary summary={project.html} />*/}
      </BackgroundImage>
    </article>
  </li>;
};

FeaturedImageProjectCard.propTypes = {
  project: PropTypes.objectOf(PropTypes.object)
};

FeaturedImageProjectCard.defaultProps = {};

export default FeaturedImageProjectCard;