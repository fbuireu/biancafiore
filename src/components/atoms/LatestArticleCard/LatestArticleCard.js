import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { useIntl } from 'gatsby-plugin-intl';
import moment from 'moment';
import 'moment/min/moment-with-locales.min.js';
import PropTypes from 'prop-types';
import React from 'react';
import slugify from '../../../utils/slugify/slugify';
import './LatestArticleCard.scss';

const LatestArticleCard = ({ fields, frontmatter }) => {
  const { locale: currentLanguage } = useIntl();
  const { slug } = fields;
  const { author, content: { title, publishDate, featuredImage, tags } } = frontmatter;

  return <li className={`latest-articles__item`}>
    <Link className={`latest-articles__item__card`} to={`/${currentLanguage}/blog${slug}`}>
      <Img className={`latest-articles__item__image`} fluid={featuredImage?.childImageSharp?.fluid}/>
      <h4 className={`latest-articles__item__title`}>{title}</h4>
      <ul className={`latest-articles__item__tag__list`}>
        {tags.map(tag => <Link key={tag} className={`latest-articles__item__tag__item`} to={`/${currentLanguage}/tag/${slugify(tag)}`}>#{tag}</Link>)}
      </ul>
      <Link className={`latest-articles__author`} to={`/${currentLanguage}/tag/${slugify(author)}`}>{author}</Link>
      <time className={`latest-articles__date`}
            dateTime={publishDate}>
        {moment(publishDate)
          .locale(currentLanguage)
          .format(`LL`)}
      </time>
    </Link>
  </li>;
};

LatestArticleCard.propTypes = {
  fields: PropTypes.string.isRequired,
  frontmatter: PropTypes.string.isRequired
};

LatestArticleCard.defaultProps = {};

export default LatestArticleCard;