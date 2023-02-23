import PropTypes from 'prop-types';
import {connectHits} from 'react-instantsearch-dom';
import FeaturedImageProjectCard from '../FeaturedImageProjectCard/FeaturedImageProjectCard';
import './ProjectHitCard.scss';
import React from 'react';

const CustomHit = ({hits: projects}) => {
  return (
    <ul className={`projects-card__list`}>
      {projects.map((project) => (
        <FeaturedImageProjectCard key={project.content.title} {...project} />
      ))}
    </ul>
  );
};

CustomHit.propTypes = {
  hits: PropTypes.objectOf(PropTypes.object),
}

CustomHit.defaultProps = {};

export const ProjectHitCard = connectHits(CustomHit);
