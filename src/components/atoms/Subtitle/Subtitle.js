import { Link } from 'gatsby';
import { useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import slugify from 'slugify';
import './Subtitle.scss';

const Subtitle = ({ lastUpdated, author }) => {
  const { locale: currentLanguage } = useIntl();

  return <p className={`article__subtitle`}>
    <time dateTime={lastUpdated}>{lastUpdated}</time>
    &nbsp;|&nbsp;
    <Link to={`/${currentLanguage}/tag/${slugify(author, { lower: true })}`}
          className={`article__author`}>{author}</Link>

  </p>;
};

Subtitle.propTypes = {
  lastUpdated: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
};

Subtitle.defaultProps = {};

export default Subtitle;