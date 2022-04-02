import Img from 'gatsby-image';
import { Link, useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import { localizeDate } from '../../../utils/localizeDate/localizeDate';
import slugify from '../../../utils/slugify/slugify';
import './RelatedArticle.scss';

const RelatedArticle = ({
  article: {
    fields: { slug },
    frontmatter: {
      author,
      content: { title, publishDate, featuredImage }
    }
  }
}) => {
  const { locale } = useIntl();

  return (
    <li className={`related-article__item`}>
      <Link className={`related-article__item__card`} to={`/blog${slug}`}>
        <Img fluid={featuredImage?.childImageSharp?.fluid}
             className={`related-article__item__image`} />
        <h4 className={`related-article__item__title`}>{title}</h4>
        <Link className={`related-article__author`}
              to={`/tags/${slugify(author)}`}>{author}</Link>
        <time className={`related-article__date`}
              dateTime={publishDate}>
          {localizeDate({ date: publishDate, locale })}
        </time>
      </Link>
    </li>
  );
};

RelatedArticle.propTypes = {
  article: PropTypes.string.isRequired
};

RelatedArticle.defaultProps = {};

export default RelatedArticle;