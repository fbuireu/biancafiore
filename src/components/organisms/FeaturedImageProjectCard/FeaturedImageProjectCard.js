import BackgroundImage from 'gatsby-background-image';
import PropTypes from 'prop-types';
import HitTitle from '../../atoms/HitTitle/HitTitle';
import HitTags from '../../molecules/HitTags/HitTags';

const FeaturedImageProjectCard = project => {
  return (
    <li className={`hit-card__item`}>
      <article className={`hit-card__item__inner`}>
        <BackgroundImage className={`hit-card__image`}
                         fluid={[
                           `linear-gradient(rgba(0,0,0, .5), rgba(0, 0, 0, .8))`,
                           project?.content?.featuredImage?.childImageSharp?.fluid]}>
          <header>
            <HitTitle hit={project} attribute={`title`} />
            <HitTags hit={project} attribute={`tags`} />
            {/*<Summary summary={project.html} />*/}
          </header>
        </BackgroundImage>
      </article>
    </li>
  );
};

FeaturedImageProjectCard.propTypes = {
  project: PropTypes.objectOf(PropTypes.object)
};

FeaturedImageProjectCard.defaultProps = {};

export default FeaturedImageProjectCard;