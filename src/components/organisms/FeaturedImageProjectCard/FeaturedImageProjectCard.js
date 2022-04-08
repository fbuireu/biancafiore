import Img from 'gatsby-image';
import { Link } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import { Highlight } from 'react-instantsearch-dom';
import slugify from '../../../utils/slugify/slugify';

const FeaturedImageProjectCard = project => {
  console.log(`project`, project);
  return (
    <li className={`hit-card__item`}>
      <article className={`hit-card__item__inner`}>
        <Img className={`hit-card__featured-image`} fluid={project?.content?.featuredImage?.childImageSharp?.fluid} />
        <div className={`hit-card__information`}>
          <ul className={`hit-card__information__tags__list`}>
            {project.content.tags.map((tag, index) => (
              <li className={`hit-card__information__tag__item`} key={tag}>
                <Link to={`/tags/${slugify(tag)}`}
                      className={`hit-card__information__tag__item__link`}>
                  #<Highlight attribute={`content.tags[${index}]`} hit={project} tagName={`mark`} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </li>
  );
};

FeaturedImageProjectCard.propTypes = {
  project: PropTypes.objectOf(PropTypes.object)
};

FeaturedImageProjectCard.defaultProps = {};

export default FeaturedImageProjectCard;