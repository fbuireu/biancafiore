import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { useIntl } from 'gatsby-plugin-intl';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import React from 'react';
import slugify from '../../../utils/slugify/slugify';
import './LatestArticleCard.scss';

const LatestArticleCard = ({ fields, frontmatter }) => {
  const { locale: currentLanguage } = useIntl();
  const { slug } = fields;
  const { author, content: { title, publishDate, featuredImage } } = frontmatter;

  return (
    <li className={`latest-articles__item`}>
      <Link className={`latest-articles__item__card`} to={`/${currentLanguage}/blog${slug}`}>
        <Img fluid={featuredImage?.childImageSharp?.fluid}
             className={`latest-articles__item__image`} />
        <h4 className={`latest-articles__item__title`}>{title}</h4>
        <Link className={`latest-articles__author`} to={`/${currentLanguage}/tag/${slugify(author)}`}>{author}</Link>
        <time className={`latest-articles__date`}
              dateTime={publishDate}>
          {moment(publishDate)
            .locale(currentLanguage)
            .format(`LL`)
          }
        </time>
      </Link>
    </li>
  );
};

LatestArticleCard.propTypes = {
  fields: PropTypes.string.isRequired,
  frontmatter: PropTypes.string.isRequired
};

LatestArticleCard.defaultProps = {};

export default LatestArticleCard;