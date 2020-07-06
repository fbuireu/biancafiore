import { Link } from 'gatsby';
import BackgroundImage from 'gatsby-background-image';
import PropTypes from 'prop-types';
import React from 'react';
import ArticleHitSummary from '../../atoms/ArticleHitSummary/ArticleHitSummary';
import ArticleHitTitle from '../../atoms/ArticleHitTitle/ArticleHitTitle';
import ReadingTime from '../../atoms/ReadingTime/ReadingTime';
import Subtitle from '../../atoms/Subtitle/Subtitle';
import Tag from '../../atoms/Tag/Tag';

export const FeaturedImageArticleCard = article => <li className={`article-card__item ${article.content.isFeaturedArticle ? `--is-featured` : ``}`}>
  <article className={`article-card__item__inner`}>
    <BackgroundImage className={`article-card__image`}
                     fluid={[
                       `linear-gradient(rgba(0,0,0, .4), rgba(0, 0, 0, .8))`,
                       article.content.featuredImage.childImageSharp.fluid]}>
      <Link to={`/${article.language.toLowerCase()}/blog${article.fields.slug}`}
            className={`article-card__link`}>
        <ArticleHitTitle hit={article} />
        {console.log(article)}
        <Subtitle author={article.author} lastUpdated={article.content.lastUpdated} />
        <ReadingTime readingTime={article.content.readingTime} />
        <Tag tags={article.content.tags} />
        <ArticleHitSummary hit={article} article={article} />
      </Link>
    </BackgroundImage>
  </article>
</li>;

FeaturedImageArticleCard.propTypes = {
  article: PropTypes.objectOf(PropTypes.object),
};

FeaturedImageArticleCard.defaultProps = {};

export default FeaturedImageArticleCard;