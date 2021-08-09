import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { useIntl } from 'gatsby-plugin-intl';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import slugify from '../../../utils/slugify/slugify';
import './HomeLatestArticleCard.scss';

const HomeLatestArticleCard = ({
  fields: { slug },
  frontmatter: {
    author,
    content: { title, publishDate, featuredImage }
  }
}) => {
  const { locale: currentLanguage } = useIntl();

  return (
    <li className={`home__latest-articles__item`}>
      <Link className={`home__latest-articles__item__card`} to={`/${currentLanguage}/blog${slug}`}>
        <Img fluid={featuredImage?.childImageSharp?.fluid}
             className={`home__latest-articles__item__image`} />
        <h4 className={`home__latest-articles__item__title`}>{title}</h4>
        <Link className={`home__latest-articles__author`}
              to={`/${currentLanguage}/tag/${slugify(author)}`}>{author}</Link>
        <time className={`home__latest-articles__date`}
              dateTime={publishDate}>
          {moment(new Date(publishDate))
            .locale(currentLanguage)
            .format(`LL`)
          }
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