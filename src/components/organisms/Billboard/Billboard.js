import { Link } from 'gatsby';
import {useI18next} from 'gatsby-plugin-react-i18next';
import PropTypes from 'prop-types';
import Clock from '../../../assets/svg-components/clock.svg';
import {localizeDate} from '../../../utils/localizeDate/localizeDate';
import slugify from '../../../utils/slugify/slugify';
import Author from '../../atoms/Author';
import Breadcrumbs from '../../atoms/Breadcrumbs/Breadcrumbs';
import ShareButtons from '../../atoms/ShareButtons/ShareButtons';
import Title from '../../atoms/Title/Title';
import './Billboard.scss';
import React from 'react';
import {GatsbyImage} from 'gatsby-plugin-image';

const Billboard = ({
  frontmatter,
  author,
  tags,
  location,
  shareParameters,
}) => {
  const {
    i18n: {language: locale},
  } = useI18next();

  let slugName =
      location?.href?.split(`/`)[
        location?.href?.split(`/`).length - (location?.href.endsWith(`/`) ? 2 : 1)
      ]

  let customBreadcrumb = {
    position: location?.pathname?.split(`/`).findIndex((slug) => slug === slugName),
    label: frontmatter.content.title,
  }
  return (
    <section>
      <section className="article__billboard" style={{position: `relative`}}>
        <GatsbyImage style={{
          position: `absolute`,
          width: `100%`,
          height: `100%`,
        }} alt="" image={frontmatter?.content?.featuredImage?.childImageSharp?.gatsbyImageData
        }/>
      </section>
      <section className={`wrapper article__information`}>
        <Title title={frontmatter.content.title}/>
        <Breadcrumbs
              location={location}
              customBreadcrumb={customBreadcrumb}
              classNames={`article__information`}
        />
        <div className={`article__information__readingTime-publishDate`}>
          <p className={`article__information__readingTime`}>
            <Clock/>
            {frontmatter.content.readingTime}min
          </p>
          <span className={`separator`}>|</span>
          <time
                className={`article__information__publishDate`}
                dateTime={localizeDate({
                  date: frontmatter.content.publishDate,
                  locale,
                })}
          >
            {localizeDate({date: frontmatter.content.publishDate, locale})}
          </time>
        </div>
        <ul className={`article__information__tags__list`}>
          {tags.map((tag) => (
            <li className={`article__information__tag__item`} key={tag}>
              <Link
                to={`/tags/${slugify(tag)}`}
                className={`article__information__tag__item__link`}
              >
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
        <Author author={author}/>
        <ShareButtons
          classNames={`article__information`}
          shareParameters={shareParameters}
          tags={tags}
        />
      </section>
    </section>
  )
};

Billboard.propTypes = {
  frontmatter: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  shareParameters: PropTypes.object.isRequired,
  author: PropTypes.objectOf(PropTypes.object).isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
};

Billboard.defaultProps = {};

export default Billboard;
