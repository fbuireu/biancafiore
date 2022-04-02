import BackgroundImage from 'gatsby-background-image';
import { Link, useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import Clock from '../../../assets/svg-components/clock.svg';
import { localizeDate } from '../../../utils/localizeDate/localizeDate';
import slugify from '../../../utils/slugify/slugify';
import Author from '../../atoms/Author';
import Breadcrumbs from '../../atoms/Breadcrumbs/Breadcrumbs';
import ShareButtons from '../../atoms/ShareButtons/ShareButtons';
import Title from '../../atoms/Title/Title';
import './Billboard.scss';

const Billboard = ({ frontmatter, author, tags, location, shareParameters }) => {
  const { locale } = useIntl();

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
      <div className={`article__information__readingTime-publishDate`}>
        <p className={`article__information__readingTime`}><Clock />{frontmatter.content.readingTime}min</p>
        <span className={`separator`}>|</span>
        <time className={`article__information__publishDate`}
              dateTime={localizeDate({ date: frontmatter.content.publishDate, locale })}>
          {localizeDate({ date: frontmatter.content.publishDate, locale })}
        </time>
      </div>
      <ul className={`article__information__tags__list`}>
        {tags.map(tag => (
          <li className={`article__information__tag__item`} key={tag}>
            <Link to={`/tags/${slugify(tag)}`}
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