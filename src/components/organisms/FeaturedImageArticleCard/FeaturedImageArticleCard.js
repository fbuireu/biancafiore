import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import { Highlight } from 'react-instantsearch-dom';
import slugify from '../../../utils/slugify/slugify';
import HitTitle from '../../atoms/HitTitle/HitTitle';
import ReadingTime from '../../atoms/ReadingTime/ReadingTime';
import Summary from '../../atoms/Summary/Summary';
import HitTags from '../../molecules/HitTags/HitTags';
import './FeaturedImageArticleCard.scss';

const FeaturedImageArticleCard = article => {
  const { locale: currentLanguage } = useIntl();

  return <article
    className={`featured-image-hit-card__item ${article?.content?.isFeaturedArticle ? `--is-featured` : ``}`}>
    <Img className={`hit-card__featured-image`} fluid={article?.content?.featuredImage?.childImageSharp?.fluid} />
    <Link to={`/${currentLanguage}/blog${article.fields.slug}`}
          className={`hit-card__link`}>
      <HitTitle hit={article} attribute={`content.title`} />
    </Link>
    <time dateTime={article.content.lastUpdated} className={`hit-card__publish-date`}>
      <Highlight attribute={`content.lastUpdated`} hit={article} tagName={`mark`} />
    </time>
    <Link to={`/${currentLanguage}/tag/${slugify(article.author)}`}
          className={`hit-card__author`}>
      <Highlight attribute={`author`} hit={article} tagName={`mark`} />
    </Link>
    <ReadingTime readingTime={article.content.readingTime} classNames={`hit-card__reading-time`} />
    <HitTags hit={article} attribute={`content.tags`} />
    <Summary summary={article.content.summary ?? article.excerpt} classNames={`hit-card__summary`} />
  </article>;

};

FeaturedImageArticleCard.propTypes = {
  article: PropTypes.objectOf(PropTypes.object),
};

FeaturedImageArticleCard.defaultProps = {};

export default FeaturedImageArticleCard;