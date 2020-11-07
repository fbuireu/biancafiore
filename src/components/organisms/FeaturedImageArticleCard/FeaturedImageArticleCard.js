import { Link } from 'gatsby';
import BackgroundImage from 'gatsby-background-image';
import { IntlContextConsumer } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import React from 'react';
import ArticleHitSubtitle from '../../atoms/ArticleHitSubtitle/ArticleHitSubtitle';
import ArticleHitTitle from '../../atoms/ArticleHitTitle/ArticleHitTitle';
import ReadingTime from '../../atoms/ReadingTime/ReadingTime';
import Summary from '../../atoms/Summary/Summary';
import ArticleHitTag from '../../molecules/ArticleHitTag/ArticleHitTag';

export const FeaturedImageArticleCard = article => <li className={`article-card__item ${article.content.isFeaturedArticle ? `--is-featured` : ``}`}>
  <article className={`article-card__item__inner`}>
    <IntlContextConsumer>
      {({ language: currentLanguage }) => <BackgroundImage className={`article-card__image`}
                                                           fluid={[
                                                             `linear-gradient(rgba(0,0,0, .5), rgba(0, 0, 0, .8))`,
                                                             article.content.featuredImage.childImageSharp.fluid]}>
        <Link to={`/${currentLanguage}/blog${article.fields.slug}`}
              className={`article-card__link`}>
          <ArticleHitTitle hit={article} />
          <ArticleHitSubtitle hit={article} />
          <ReadingTime readingTime={article.content.readingTime} />
          <ArticleHitTag hit={article} />
          <Summary summary={article.content.summary || article.excerpt} />
        </Link>
      </BackgroundImage>
      }
    </IntlContextConsumer>

  </article>
</li>;

FeaturedImageArticleCard.propTypes = {
  article: PropTypes.objectOf(PropTypes.object),
};

FeaturedImageArticleCard.defaultProps = {};

export default FeaturedImageArticleCard;