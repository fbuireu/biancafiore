import PropTypes from 'prop-types';
import { connectHits } from 'react-instantsearch-dom';
import Masonry from 'react-masonry-css';
import FeaturedImageArticleCard from '../FeaturedImageArticleCard/FeaturedImageArticleCard';
import SimpleArticleCard from '../SimpleArticleCard/SimpleArticleCard';
import './ArticleHitCard.scss';

const CustomHit = ({ hits: articles }) => {
  const BREAKPOINT_COLUMNS = {
    default: 3,
    760: 2,
    500: 1
  };

  return <ul className={`articles-card__list`}>
    <Masonry breakpointCols={BREAKPOINT_COLUMNS}
             className={`articles-card__list__masonry`}
             columnClassName={`articles-card__list__item`}
    >
      {articles.map(article => article.content.featuredImage
        ? <FeaturedImageArticleCard key={article.content.title} {...article} />
        : <SimpleArticleCard key={article.content.title} {...article} />
      )}
    </Masonry>
  </ul>;
};

CustomHit.propTypes = {
  hits: PropTypes.objectOf(PropTypes.object),
};

CustomHit.defaultProps = {};

export const ArticleHitCard = connectHits(CustomHit);
