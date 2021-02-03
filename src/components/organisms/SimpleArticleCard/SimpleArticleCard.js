import { Link } from 'gatsby';
import { useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import HitSubtitle from '../../atoms/HitSubtitle/HitSubtitle';
import HitTitle from '../../atoms/HitTitle/HitTitle';
import ReadingTime from '../../atoms/ReadingTime/ReadingTime';
import Summary from '../../atoms/Summary/Summary';
import HitTags from '../../molecules/HitTags/HitTags';

const SimpleArticleCard = article => {
  const { locale: currentLanguage } = useIntl();

  return <li className={`article-card__item ${article.content.isFeaturedArticle ? `--is-featured` : ``}`}>
    <article>
      <Link to={`/${currentLanguage}/blog${article.fields.slug}`}
            className={`article-card__link`}>
        <header>
          <HitTitle hit={article} attribute={`content.title`} />
          <HitSubtitle hit={article} attribute={`content.lastUpdated`} hasAuthor={true} />
          <ReadingTime readingTime={article.content.readingTime} classNames={`hit-card__reading-time`} />
          <HitTags hit={article} attribute={`content.tags`} />
          <Summary summary={article.content.summary || article.excerpt} classNames={`hit-card__summary`} />
        </header>
      </Link>
    </article>
  </li>;
};

SimpleArticleCard.propTypes = {
  article: PropTypes.objectOf(PropTypes.object),
};

SimpleArticleCard.defaultProps = {};

export default SimpleArticleCard;