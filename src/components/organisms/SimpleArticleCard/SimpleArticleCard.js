import { Link } from 'gatsby';
import { IntlContextConsumer } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import HitSubtitle from '../../atoms/HitSubtitle/HitSubtitle';
import HitTitle from '../../atoms/HitTitle/HitTitle';
import ReadingTime from '../../atoms/ReadingTime/ReadingTime';
import Summary from '../../atoms/Summary/Summary';
import HitTags from '../../molecules/HitTags/HitTags';

export const SimpleArticleCard = article => {
  return <li className={`article-card__item ${article.content.isFeaturedArticle ? `--is-featured` : ``}`}>
    <article>
      <IntlContextConsumer>
        {({ language: currentLanguage }) => <Link to={`/${currentLanguage}/blog${article.fields.slug}`}
                                                  className={`article-card__link`}>
          <HitTitle hit={article} attribute={`content.title`} />
          <HitSubtitle hit={article} attribute={`content.lastUpdated`} hasAuthor={true} />
          <ReadingTime readingTime={article.content.readingTime} classNames={`hit-card__reading-time`} />
          <HitTags hit={article} attribute={`content.tags`} />
          <Summary summary={article.content.summary || article.excerpt} classNames={`hit-card__summary`} />
        </Link>
        }
      </IntlContextConsumer>

    </article>
  </li>;
};

SimpleArticleCard.propTypes = {
  article: PropTypes.objectOf(PropTypes.object),
};

SimpleArticleCard.defaultProps = {};

export default SimpleArticleCard;