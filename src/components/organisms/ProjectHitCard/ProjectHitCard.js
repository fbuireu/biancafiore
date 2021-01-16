import PropTypes from 'prop-types';
import React from 'react';
import { connectHits } from 'react-instantsearch-dom';
import FeaturedImageProjectCard from '../FeaturedImageProjectCard/FeaturedImageProjectCard';
import SimpleProjectCard from '../SimpleProjectCard/SimpleProjectCard';
import './ProjectHitCard.scss';

const CustomHit = ({ hits: projects }) => {
  return <ul className={`projects-card__list`}>
    {projects.map(project => project.content.featuredImage
      ? <FeaturedImageProjectCard key={project.content.title} {...project} />
      : <SimpleProjectCard key={project.content.title} {...project} />,
    )}
  </ul>;
};

CustomHit.propTypes = {
  hits: PropTypes.objectOf(PropTypes.object),
};

CustomHit.defaultProps = {};

export const ProjectHitCard = connectHits(CustomHit);
