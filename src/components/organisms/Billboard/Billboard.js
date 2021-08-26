import BackgroundImage from 'gatsby-background-image';
import { Link } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import slugify from '../../../utils/slugify/slugify';
import Author from '../../atoms/Author/Author';
import Breadcrumbs from '../../atoms/Breadcrumbs/Breadcrumbs';
import ShareButtons from '../../atoms/ShareButtons/ShareButtons';
import Title from '../../atoms/Title/Title';
import './Billboard.scss';

const Billboard = ({ frontmatter, author, tags, location, shareParameters }) => {
  let slugName = location?.href?.split(`/`)[location?.href?.split(`/`).length - (location?.href.endsWith(`/`) ? 2 : 1)];

  let customBreadcrumb = {
    position: location?.pathname?.split(`/`).findIndex(slug => slug === slugName),
    label: frontmatter.content.title
  };
  return <section>
    <BackgroundImage className={`article__billboard`}
                     fluid={frontmatter?.content?.featuredImage?.childImageSharp?.fluid}>
    </BackgroundImage>
    <section className={`wrapper article__information`}>
      <Title title={frontmatter.content.title} />
      <Breadcrumbs location={location} customBreadcrumb={customBreadcrumb} classNames={`article__information`} />
      <ul className={`article__information__tags__list`}>
        {tags.map(tag => (
          <li className={`article__information__tag__item`} key={tag}>
            <Link to={`/tag/${slugify(tag)}`}
                  className={`article__information__tag__item__link`}>
              #{tag}
            </Link>
          </li>
        ))}
      </ul>
      <Author author={author} />
      <ShareButtons classNames={`article__information`} shareParameters={shareParameters} tags={tags} />
    </section>
  </section>;
};

Billboard.propTypes = {
  frontmatter: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  shareParameters: PropTypes.object.isRequired,
  author: PropTypes.objectOf(PropTypes.object).isRequired,
  tags: PropTypes.arrayOf(PropTypes.string)
};

Billboard.defaultProps = {};

export default Billboard;