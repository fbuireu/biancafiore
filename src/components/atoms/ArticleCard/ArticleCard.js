import { Link } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import './ArticleCard.scss';

const ArticleCard = ({ article }) => {
  let { excerpt, fields, frontmatter } = article,
    summary = frontmatter.content.summary ?? excerpt;

  return <li className={`article-card__item`}>
    <Link to={`/blog${fields.slug}`}>
      <article>
        <h4>{frontmatter.content.title}</h4>
        <p>{summary}</p>
      </article>
    </Link>
  </li>;
};

ArticleCard.propTypes = {
  article: PropTypes.objectOf(PropTypes.object),
};

ArticleCard.defaultProps = {};

export default ArticleCard;