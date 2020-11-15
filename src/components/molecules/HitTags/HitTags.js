import { Link } from 'gatsby';
import { IntlContextConsumer } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import { Highlight } from 'react-instantsearch-dom';
import slugify from 'slugify';
import Label from '../../../assets/svg/label.svg';
import './HitTags.scss';

const HitTags = ({ hit, attribute }) => {
  return <ul className={`hit-card__tags__list`}>
    <IntlContextConsumer>
      {({ language: currentLanguage }) => {
        if (hit.content) {
          return hit.content.tags.map((tag, index) => <li className={`hit-card__tag__item`} key={tag}>
            <Link to={`/${currentLanguage}/tag/${slugify(tag, { lower: true })}`}
                  className={`hit-card__tag__item__link`}>
              <Label className={`hit-card__tag__item__label`} />
              <Highlight attribute={`${attribute}[${index}]`} hit={hit} tagName={`mark`} />
            </Link>
          </li>
          );
        }
        return hit.tags.map((tag, index) => <li className={`hit-card__tag__item`} key={tag}>
          <Link to={`/${currentLanguage}/tag/${slugify(tag, { lower: true })}`}
                className={`hit-card__tag__item__link`}>
            <Label className={`hit-card__tag__item__label`} />
            <Highlight attribute={`${attribute}[${index}]`} hit={hit} tagName={`mark`} />
          </Link>
        </li>
        );
      }}
    </IntlContextConsumer>
  </ul>;
};

HitTags.propTypes = {
  hit: PropTypes.arrayOf(PropTypes.string).isRequired,
  attribute: PropTypes.string
};

HitTags.defaultProps = {};

export default HitTags;