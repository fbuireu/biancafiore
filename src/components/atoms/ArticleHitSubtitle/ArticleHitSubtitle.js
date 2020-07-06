import { Link } from 'gatsby';
import { IntlContextConsumer } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import { Highlight } from 'react-instantsearch-dom';
import slugify from 'slugify';

const ArticleHitSubtitle = ({ hit }) => <p className={`article__subtitle`}>
  <time dateTime={hit.content.lastUpdated}><Highlight attribute={`content.lastUpdated`} hit={hit} tagName={`mark`} /></time>
  &nbsp;|&nbsp;
  <IntlContextConsumer>
    {({ language: currentLanguage }) => <Link to={`/${currentLanguage}/tag/${slugify(hit.author, { lower: true })}`} className={`article__author`}>
      <Highlight attribute={`author`} hit={hit} tagName={`mark`} />
    </Link>}
  </IntlContextConsumer>
</p>;

ArticleHitSubtitle.propTypes = {
  hit: PropTypes.objectOf(PropTypes.object),
};

ArticleHitSubtitle.defaultProps = {};

export default ArticleHitSubtitle;