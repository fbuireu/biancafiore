import PropTypes from 'prop-types';
import { connectHits } from 'react-instantsearch-dom';
import Masonry from 'react-masonry-css';
import FeaturedImageArticleCard from '../FeaturedImageArticleCard/FeaturedImageArticleCard';
import SimpleArticleCard from '../SimpleArticleCard/SimpleArticleCard';
import './ArticleHitCard.scss';

const CustomHit = ({ hits: articles }) => {
  const ELEMENTS_PER_COLUMN = {
    default: 3,
    760: 2,
    500: 1
  };

  return <Masonry breakpointCols={ELEMENTS_PER_COLUMN}
                  className={`articles-card__list__masonry`}
                  columnClassName={`articles-card__list__item`}
  >
    {articles.map(article => article.content.featuredImage
      ? <FeaturedImageArticleCard key={article.content.title} {...article} />
      : <SimpleArticleCard key={article.content.title} {...article} />
    )}
  </Masonry>;

};

CustomHit.propTypes = {
  hits: PropTypes.objectOf(PropTypes.object),
};

CustomHit.defaultProps = {};

export const ArticleHitCard = connectHits(CustomHit);
