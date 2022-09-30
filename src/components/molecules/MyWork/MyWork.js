import { Link } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { useI18next } from 'gatsby-plugin-react-i18next'
import PropTypes from 'prop-types'
import { useLatestProjects } from '../../../utils/hooks/useLatestProjects'
import slugify from '../../../utils/slugify/slugify'
import './MyWork.scss'
import 'swiper/css'
import React from 'react'

const MyWork = ({ title }) => {
  const latestProjects = useLatestProjects()
  const {
    i18n: { language: locale },
  } = useI18next()

  return (
    <section className={`my-work__wrapper wrapper`}>
      <h2 className={`my-work__title`}>{title}</h2>
      <ul className={`my-work__list`}>
        {latestProjects.map(({ node: latestProject }) => {
          return (
            <Link
              className={`my-work__item`}
              key={latestProject.frontmatter.content.name}
              to={`/${locale}/projects/${slugify(
                latestProject.frontmatter.content.name,
              )}`}
            >
              <GatsbyImage
                image={
                  latestProject.frontmatter.content.featuredImage.childImageSharp.gatsbyImageData
                }
                className={`my-work__item__image`}
                alt={latestProject.frontmatter.content.name}
              />
              <h3 className={`my-work__item__name`}>
                {latestProject.frontmatter.content.name}
              </h3>
            </Link>
          );
        })}
      </ul>
    </section>
  );
};

MyWork.propTypes = {
  title: PropTypes.string.isRequired,
  works: PropTypes.arrayOf(PropTypes.object).isRequired,
};

MyWork.defaultProps = {};

export default MyWork;
