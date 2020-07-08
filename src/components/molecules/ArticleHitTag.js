import { Link } from 'gatsby';
import { IntlContextConsumer } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import { Highlight } from 'react-instantsearch-dom';
import slugify from 'slugify';
import Label from '../../assets/svg/label.svg';

const Tag = ({ hit }) => <ul className={`article__tags__list`}>
  <IntlContextConsumer>
    {({ language: currentLanguage }) =>
      hit.content.tags.map((tag, index) => <li className={`article__tag__item`} key={tag}>
        <Link to={`/${currentLanguage}/tag/${slugify(tag, { lower: true })}`} className={`article__tag__item__link`}>
          <Label className={`article__tag__item__label`} />
          <Highlight attribute={`content.tags[${index}]`} hit={hit} tagName={`mark`} />
        </Link>
      </li>,
      )}
  </IntlContextConsumer>
</ul>;

Tag.propTypes = {
  hit: PropTypes.arrayOf(PropTypes.string),
};

Tag.defaultProps = {};

export default Tag;