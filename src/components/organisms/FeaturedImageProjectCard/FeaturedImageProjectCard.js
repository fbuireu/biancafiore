import {GatsbyImage} from 'gatsby-plugin-image';
import {Link} from 'gatsby-plugin-react-i18next';
import PropTypes from 'prop-types';
import {Highlight} from 'react-instantsearch-dom';
import slugify from '../../../utils/slugify/slugify';
import React from 'react';

const FeaturedImageProjectCard = (project) => {
  return (
    <li className={`hit-card__item`}>
      <article className={`hit-card__item__inner`}>
        <Link to={`/projects/${slugify(project.content.name)}`}>
          <GatsbyImage
                image={
                  project?.content?.featuredImage?.childImageSharp?.gatsbyImageData
                }
                className={`hit-card__featured-image`}
                alt={project.content.name}/>
        </Link>
        <div className={`hit-card__information`}>
          <Link to={`/projects/${slugify(project.content.name)}`}>
            <h2>{project.content.name}</h2>
          </Link>
          <ul className={`hit-card__information__tags__list`}>
            {project.content.tags.map((tag, index) => (
              <li className={`hit-card__information__tag__item`} key={tag}>
                <Link
                        to={`/tags/${slugify(tag)}`}
                        className={`hit-card__information__tag__item__link`}
                >
                  #
                  <Highlight
                          attribute={`content.tags[${index}]`}
                          hit={project}
                          tagName={`mark`}
                  />
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
  project: PropTypes.objectOf(PropTypes.object),
};

FeaturedImageProjectCard.defaultProps = {};

export default FeaturedImageProjectCard;
