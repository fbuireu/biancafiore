import PropTypes from 'prop-types'
import RelatedArticle from '../../atoms/RelatedArticle/RelatedArticle'
import './RelatedArticles.scss'
import React from 'react'

const RelatedArticles = ({ relatedArticles, relatedArticlesTitle }) => {
  return <section className={`related-articles__wrapper wrapper`}>
    <h2 className={`related-articles__title`}>{relatedArticlesTitle}</h2>
    <ul className={`related-articles__list`}>
      {relatedArticles.map(
        ({ node: relatedArticle }) => <RelatedArticle
          key={relatedArticle.fields.slug} article={relatedArticle}/>)}
    </ul>
  </section>
}

RelatedArticles.propTypes = {
  relatedArticles: PropTypes.arrayOf(PropTypes.object),
  relatedArticlesTitle: PropTypes.arrayOf(PropTypes.object)
};

RelatedArticles.defaultProps = {};

export default RelatedArticles;