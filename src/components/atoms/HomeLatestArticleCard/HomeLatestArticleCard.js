import Img from 'gatsby-image';
import { Link, useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import { localizeDate } from '../../../utils/localizeDate/localizeDate';
import slugify from '../../../utils/slugify/slugify';
import './HomeLatestArticleCard.scss';

const HomeLatestArticleCard = ({
  fields: { slug },
  frontmatter: {
    author,
    content: { title, publishDate, featuredImage }
  }
}) => {
  const { locale } = useIntl();

  return (
    <li className={`home__latest-articles__item`}>
      <Link className={`home__latest-articles__item__card`} to={`/blog${slug}`}>
        <Img fluid={featuredImage?.childImageSharp?.fluid}
             className={`home__latest-articles__item__image`} />
        <h4 className={`home__latest-articles__item__title`}>{title}</h4>
        <Link className={`home__latest-articles__author`}
              to={`/tags/${slugify(author)}`}>{author}</Link>
        <time className={`home__latest-articles__date`}
              dateTime={publishDate}>
          {localizeDate({ date: publishDate, locale })}
        </time>
      </Link>
    </li>
  );
};

HomeLatestArticleCard.propTypes = {
  fields: PropTypes.string.isRequired,
  frontmatter: PropTypes.string.isRequired
};

HomeLatestArticleCard.defaultProps = {};

export default HomeLatestArticleCard;