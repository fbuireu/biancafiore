import PropTypes from 'prop-types';
import React from 'react';
import HitTitle from '../../atoms/HitTitle/HitTitle';
import HitTags from '../../molecules/HitTags/HitTags';

export const SimpleProjectCard = project => {
  return <li className={`project-card__item`}>
    <article className={`project-card__item__inner`}>
      <HitTitle hit={project} attribute={`title`} />
      <HitTags hit={project} attribute={`tags`} />
      {/*<Summary summary={project.html} />*/}
    </article>
  </li>;
};

SimpleProjectCard.propTypes = {
  project: PropTypes.objectOf(PropTypes.object)
};

SimpleProjectCard.defaultProps = {};

export default SimpleProjectCard;