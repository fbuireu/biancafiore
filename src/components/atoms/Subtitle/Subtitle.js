import { Link } from 'gatsby';
import { IntlContextConsumer } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import slugify from 'slugify';
import './Subtitle.scss';

const Subtitle = ({ lastUpdated, author }) => <p className={`subtitle`}>
  <time dateTime={lastUpdated}>{lastUpdated}</time>
  &nbsp;|&nbsp;
  <IntlContextConsumer>
    {({ language: currentLanguage }) => <Link to={`${currentLanguage}/tag/${slugify(author, { lower: true })}`} className={`author`}>{author}</Link>}
  </IntlContextConsumer>
</p>;

Subtitle.propTypes = {
  lastUpdated: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
};

Subtitle.defaultProps = {};

export default Subtitle;