import { Link } from 'gatsby';
import BackgroundImage from 'gatsby-background-image';
import { useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import HitSubtitle from '../../atoms/HitSubtitle/HitSubtitle';
import HitTitle from '../../atoms/HitTitle/HitTitle';
import ReadingTime from '../../atoms/ReadingTime/ReadingTime';
import Summary from '../../atoms/Summary/Summary';
import HitTags from '../../molecules/HitTags/HitTags';

export const FeaturedImageArticleCard = article => {
  const { locale: currentLanguage } = useIntl();

  return <li className={`hit-card__item ${article.content.isFeaturedArticle ? `--is-featured` : ``}`}>
    <article className={`hit-card__item__inner`}>
      <BackgroundImage className={`hit-card__image`}
                       fluid={[
                         `linear-gradient(rgba(0,0,0, .5), rgba(0, 0, 0, .8))`,
                         article.content.featuredImage.childImageSharp.fluid]}>
        <Link to={`/${currentLanguage}/blog${article.fields.slug}`}
              className={`hit-card__link`}>
          <HitTitle hit={article} attribute={`content.title`} />
          <HitSubtitle hit={article} attribute={`content.lastUpdated`} hasAuthor={true} />
          <ReadingTime readingTime={article.content.readingTime} classNames={`hit-card__reading-time`} />
          <HitTags hit={article} attribute={`content.tags`} />
          <Summary summary={article.content.summary || article.excerpt} classNames={`hit-card__summary`} />
        </Link>
      </BackgroundImage>
    </article>
  </li>;
};

FeaturedImageArticleCard.propTypes = {
  article: PropTypes.objectOf(PropTypes.object),
};

FeaturedImageArticleCard.defaultProps = {};

export default FeaturedImageArticleCard;