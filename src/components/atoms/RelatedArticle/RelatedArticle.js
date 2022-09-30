import { GatsbyImage } from 'gatsby-plugin-image'
import { Link, useI18next } from 'gatsby-plugin-react-i18next'
import PropTypes from 'prop-types'
import { localizeDate } from '../../../utils/localizeDate/localizeDate'
import slugify from '../../../utils/slugify/slugify'
import './RelatedArticle.scss'
import React from 'react'

const RelatedArticle = ({
  article: {
    fields: { slug },
    frontmatter: {
      author,
      content: { title, publishDate, featuredImage },
    },
  },
}) => {
  const { i18n: { language: locale } } = useI18next()

  return (
    <li className={`related-article__item`}>
      <Link className={`related-article__item__card`} to={`/blog${slug}`}>
        <GatsbyImage
          image={featuredImage?.childImageSharp?.gatsbyImageData}
          className={`related-article__item__image`}/>
        <h4 className={`related-article__item__title`}>{title}</h4>
        <Link className={`related-article__author`}
              to={`/tags/${slugify(author)}`}>{author}</Link>
        <time className={`related-article__date`}
              dateTime={publishDate}>
          {localizeDate({ date: publishDate, locale })}
        </time>
      </Link>
    </li>
  );
};

RelatedArticle.propTypes = {
  article: PropTypes.string.isRequired
};

RelatedArticle.defaultProps = {};

export default RelatedArticle;