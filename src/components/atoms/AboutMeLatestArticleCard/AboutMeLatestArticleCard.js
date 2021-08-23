import Img from 'gatsby-image';
import { Link, useIntl } from 'gatsby-plugin-intl';
import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import { localizeDate } from '../../../utils/localizeDate/localizeDate';
import slugify from '../../../utils/slugify/slugify';
import './AboutMeLatestArticleCard.scss';

const AboutMeLatestArticleCard = ({
  fields: { slug },
  excerpt,
  frontmatter: { author, content: { title, summary, publishDate, featuredImage } }
}) => {

  const {locale:currentLanguage} = useIntl();

  return (
    <li className={`about-me__latest-articles__item`}>
      <Link className={`about-me__latest-articles__item__card`} to={`/blog${slug}`}>
        <Img fluid={featuredImage?.childImageSharp?.fluid}
             className={`about-me__latest-articles__item__image`} />
        <h4 className={`about-me__latest-articles__item__title`}>{title}</h4>
        <Link className={`about-me__latest-articles__author`}
              to={`/tag/${slugify(author)}`}>{author}</Link>
        <time className={`about-me__latest-articles__date`}
              dateTime={publishDate}>
          {localizeDate(publishDate, currentLanguage)}
        </time>
        <Markdown className={`about-me__latest-articles__summary`}
                  options={{ wrapper: `p`, forceWrapper: true }}>
          {summary ?? excerpt}
        </Markdown>
      </Link>
    </li>
  );
};

AboutMeLatestArticleCard.propTypes = {
  fields: PropTypes.string.isRequired,
  excerpt: PropTypes.string,
  frontmatter: PropTypes.string.isRequired
};

AboutMeLatestArticleCard.defaultProps = {};

export default AboutMeLatestArticleCard;