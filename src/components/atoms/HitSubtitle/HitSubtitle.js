import { Link } from 'gatsby';
import { useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import { Highlight } from 'react-instantsearch-dom';
import slugify from 'slugify';
import './HitSubtitle.scss';

const HitSubtitle = ({ hit, attribute, hasAuthor = false }) => {
  const { locale: currentLanguage } = useIntl();

  return <p className={`hit-card__subtitle`}>
    <time dateTime={hit.content.lastUpdated}><Highlight attribute={attribute} hit={hit} tagName={`mark`} />
    </time>
    &nbsp;|&nbsp;
    <Link to={`/${currentLanguage}/tag/${slugify(hit.author, { lower: true })}`}
          className={`hit-card__author`}>
      {hasAuthor && <Highlight attribute={`author`} hit={hit} tagName={`mark`} />}
    </Link>
  </p>;
};

HitSubtitle.propTypes = {
  hit: PropTypes.objectOf(PropTypes.object).isRequired,
  attribute: PropTypes.string.isRequired,
  hasAuthor: PropTypes.bool
};

HitSubtitle.defaultProps = {};

export default HitSubtitle;