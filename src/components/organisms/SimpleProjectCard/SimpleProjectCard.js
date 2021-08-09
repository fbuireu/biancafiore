import PropTypes from 'prop-types';
import HitTitle from '../../atoms/HitTitle/HitTitle';
import HitTags from '../../molecules/HitTags/HitTags';

const SimpleProjectCard = project => {
  return <li className={`project-card__item`}>
    <article className={`project-card__item__inner`}>
      <header>
        <HitTitle hit={project} attribute={`title`} />
        <HitTags hit={project} attribute={`tags`} />
        {/*<Summary summary={project.html} />*/}
      </header>
    </article>
  </li>;
};

SimpleProjectCard.propTypes = {
  project: PropTypes.objectOf(PropTypes.object)
};

SimpleProjectCard.defaultProps = {};

export default SimpleProjectCard;