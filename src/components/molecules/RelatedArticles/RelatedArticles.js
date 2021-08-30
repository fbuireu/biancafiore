import PropTypes from 'prop-types';
import ArticleCard from '../../atoms/ArticleCard/ArticleCard';
import './RelatedArticles.scss';

const RelatedArticles = ({ relatedArticles, relatedArticlesTitle }) => {
  return <section className={`related-articles__wrapper wrapper`}>
    <h2 className={`related-articles__title`}>{relatedArticlesTitle}</h2>
    <ul className={`related-articles__list`}>
      {relatedArticles.map(
        ({ node: relatedArticle }) => <ArticleCard key={relatedArticle.fields.slug} article={relatedArticle} />)}
    </ul>
  </section>;
};

RelatedArticles.propTypes = {
  relatedArticles: PropTypes.arrayOf(PropTypes.object),
  relatedArticlesTitle: PropTypes.arrayOf(PropTypes.object)
};

RelatedArticles.defaultProps = {};

export default RelatedArticles;