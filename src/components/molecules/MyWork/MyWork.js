import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import 'swiper/swiper.scss';
import slugify from '../../../utils/slugify/slugify';
import './MyWork.scss';

const MyWork = ({ title, works }) => {
  const { locale: currentLanguage } = useIntl();

  return <section className={`my-work__wrapper wrapper`}>
    <h2 className={`my-work__title`}>{title}</h2>
    <ul className={`my-work__list`}>
      {works.sort(() => Math.random() - .5).map(({ tags, image }) => {
        return <Link className={`my-work__item`} key={tags[0]} to={`/${currentLanguage}/tag/${slugify(tags[0])}`}>
          <Img className={`my-work__item__image`} fluid={image.childImageSharp.fluid} alt={tags[0]}/>
          <h3 className={`my-work__item__name`}>{tags[0]}</h3>
        </Link>;
      })}
    </ul>
  </section>;
};

MyWork.propTypes = {
  title: PropTypes.string.isRequired,
  works: PropTypes.arrayOf(PropTypes.object).isRequired
};

MyWork.defaultProps = {};

export default MyWork;
