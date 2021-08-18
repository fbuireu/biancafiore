import { Link } from 'gatsby';
import { useIntl } from 'gatsby-plugin-intl';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import { Highlight } from 'react-instantsearch-dom';
import slugify from '../../../utils/slugify/slugify';
import HitTitle from '../../atoms/HitTitle/HitTitle';
import Summary from '../../atoms/Summary/Summary';
import './SimpleArticleCard.scss';

const SimpleArticleCard = article => {
  const { locale: currentLanguage } = useIntl();

  return <article className={`simple-hit-card__item ${article?.content?.isFeaturedArticle ? `--is-featured` : ``}`}>
    <div className={`hit-card__information`}>
      <span className={`hit-card__information__reading-time`}>{article.content.readingTime} min.</span>
      <ul className={`hit-card__information__tags__list`}>
        {article.content.tags.map((tag, index) => (
          <li className={`hit-card__information__tag__item`} key={tag}>
            <Link to={`/${currentLanguage}/tag/${slugify(tag)}`}
                  className={`hit-card__information__tag__item__link`}>
              #<Highlight attribute={`content.tags[${index}]`} hit={article} tagName={`mark`} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
    <Link to={`/${currentLanguage}/blog${article.fields.slug}`}
          className={`hit-card__link`}>
      <HitTitle hit={article} attribute={`content.title`} />
    </Link>
    <div className={`hit-card-subtitle`}>
      <Link to={`/${currentLanguage}/tag/${slugify(article.author)}`}
            className={`hit-card-subtitle__author`}>
        <Highlight attribute={`author`} hit={article} tagName={`mark`} />
      </Link>
      <time dateTime={article.content.publishDate} className={`hit-card-subtitle__publish-date`}>
        {moment(new Date(article.content.publishDate))
          .locale(currentLanguage)
          .format(`LL`)
        }
      </time>
    </div>
    <Summary summary={article.content.summary ?? article.excerpt} classNames={`hit-card__summary`} />
    <Link to={`/${currentLanguage}/blog${article.fields.slug}`}
          className={`hit-card__cta`}>Read more</Link>
  </article>;
};

SimpleArticleCard.propTypes = {
  article: PropTypes.objectOf(PropTypes.object),
};

SimpleArticleCard.defaultProps = {};

export default SimpleArticleCard;