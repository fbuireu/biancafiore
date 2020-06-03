import { Link } from 'gatsby';
import { IntlContextConsumer } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import slugify from 'slugify';
import Label from '../../../assets/svg/label.svg';
import './Tag.scss';

const Tag = ({ tags }) => <ul className={`article__tags__list`}>
  <IntlContextConsumer>
    {({ language: currentLanguage }) =>
      tags.map((tag, index) =>
        <li className={`article__tag__item`} key={index}>
          <Link to={`${currentLanguage}/${slugify(tag, { lower: true })}`}>
            <Label className={`article__tag__item__label`} />{tag}
          </Link>
        </li>)
    }
  </IntlContextConsumer>
</ul>;

Tag.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
};

Tag.defaultProps = {};

export default Tag;