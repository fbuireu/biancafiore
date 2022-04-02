import Img from 'gatsby-image';
import { Link, useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import { Highlight } from 'react-instantsearch-dom';
import { localizeDate } from '../../../utils/localizeDate/localizeDate';
import slugify from '../../../utils/slugify/slugify';
import HitTitle from '../../atoms/HitTitle/HitTitle';
import Summary from '../../atoms/Summary/Summary';
import './FeaturedImageArticleCard.scss';

const FeaturedImageArticleCard = article => {
  const { locale } = useIntl();

  return <article
    className={`featured-image-hit-card__item ${article?.content?.isFeaturedArticle ? `--is-featured` : ``}`}>
    <Img className={`hit-card__featured-image`} fluid={article?.content?.featuredImage?.childImageSharp?.fluid} />
    <div className={`hit-card__information`}>
      <span className={`hit-card__information__reading-time`}>{article.content.readingTime} min.</span>
      <ul className={`hit-card__information__tags__list`}>
        {article.content.tags.map((tag, index) => (
          <li className={`hit-card__information__tag__item`} key={tag}>
            <Link to={`/tags/${slugify(tag)}`}
                  className={`hit-card__information__tag__item__link`}>
              #<Highlight attribute={`content.tags[${index}]`} hit={article} tagName={`mark`} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
    <Link to={`/blog${article.fields.slug}`}
          className={`hit-card__link`}>
      <HitTitle hit={article} attribute={`content.title`} />
    </Link>
    <div className={`hit-card-subtitle`}>
      <Link to={`/tags/${slugify(article.author)}`}
            className={`hit-card-subtitle__author`}>
        <Highlight attribute={`author`} hit={article} tagName={`mark`} />
      </Link>
      <time dateTime={article.content.publishDate} className={`hit-card-subtitle__publish-date`}>
        {localizeDate({ date: article.content.publishDate, locale })}
      </time>
    </div>
    <Summary summary={article.content.summary ?? article.excerpt} classNames={`hit-card__summary`} />
    <Link to={`/blog${article.fields.slug}`}
          className={`hit-card__cta`}>Read more</Link>
  </article>;

};

FeaturedImageArticleCard.propTypes = {
  article: PropTypes.objectOf(PropTypes.object),
};

FeaturedImageArticleCard.defaultProps = {};

export default FeaturedImageArticleCard;