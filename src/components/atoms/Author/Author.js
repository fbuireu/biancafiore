import Img from 'gatsby-image';
import { Link } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import slugify from '../../../utils/slugify/slugify';
import './Author.scss';

const Author = ({ author }) => {
  return (
    <section className={`author__wrapper`}>
      <Link className={`author__image__inner`}
            to={`/tag/${slugify(author.frontmatter.name)}`}>
        <Img fluid={author?.frontmatter?.image?.childImageSharp?.fluid}
             className={`author__image`}
             alt={author.frontmatter.name} />
      </Link>
      <p className={`author__description__wrapper`}>
        <span>Written by &#32;</span>
        <Link to={`/tag/${slugify(author.frontmatter.name)}`}>
          {author.frontmatter.name}
        </Link>
        <span>
          {author.frontmatter.description && <p className={`author__description`}>{author.frontmatter.description}</p>}
        </span>
      </p>
    </section>
  );
};

Author.propTypes = {
  author: PropTypes.objectOf(PropTypes.object),
};

Author.defaultProps = {
  tags: [],
};

export default Author;