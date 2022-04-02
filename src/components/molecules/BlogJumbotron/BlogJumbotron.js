import Img from 'gatsby-image';
import { Link, useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import { useSocialNetworkItems } from '../../../utils/hooks/useSocialNetworkItems';
import { localizeDate } from '../../../utils/localizeDate/localizeDate';
import slugify from '../../../utils/slugify/slugify';
import Breadcrumbs from '../../atoms/Breadcrumbs/Breadcrumbs';
import './BlogJumbotron.scss';

const BlogJumbotron = ({
  location,
  blog: {
    title: blogTitle,
    jumbotron: {
      featuredArticle: {
        cta: latestFeaturedArticleCta
      },
      socialNetworks: {
        cta: socialNetworkCta,
        socialNetworks
      }
    }
  },
  latestFeaturedArticle: {
    fields: { slug },
    frontmatter: {
      author,
      content: {
        title: latestFeaturedArticleTitle,
        tags,
        publishDate,
        readingTime,
        featuredImage
      }
    }
  }
}) => {
  const allSocialNetworkItems = useSocialNetworkItems();
  const { locale } = useIntl();

  let availableSocialNetworks = { names: [], urls: [] };

  allSocialNetworkItems.map(({ node: socialNetworkItem }) => {
    let { frontmatter: { name, url } } = socialNetworkItem;

    if (socialNetworks.includes(name)) {
      availableSocialNetworks.names.push(name);
      availableSocialNetworks.urls.push(url);
    }

    return availableSocialNetworks;
  });


  return <section className={`blog__jumbotron__wrapper wrapper`}>
    <h1 className={`blog__jumbotron__title`}>{blogTitle}</h1>
    <Breadcrumbs location={location} classNames={`blog__jumbotron`}/>
    <div className={`blog__jumbotron__inner`}>
      <Img
        className={`blog__jumbotron__latest-featured-article__image`}
        fluid={featuredImage?.childImageSharp?.fluid}
      />
      <div className={`blog__jumbotron__latest-featured-article__description`}>
        <div className={`blog__jumbotron__latest-featured-article__header`}>
          <p className={`blog__jumbotron__latest-featured-article__reading-time`}>{readingTime}min</p>
          <ul className={`blog__jumbotron__latest-featured-article__tags__list`}>
            {tags.map(tag => (
              <li key={tag} className={`blog__jumbotron__latest-featured-article__tag__item`}>
                <Link to={`/tags/${slugify(tag)}`}>#{tag}</Link>
              </li>)
            )}
          </ul>
        </div>
        <h2 className={`blog__jumbotron__latest-featured-article__title`}>{latestFeaturedArticleTitle}</h2>
        <Link className={`blog__jumbotron__latest-featured-article__author`}
              to={`/tags/${slugify(author)}`}>{author}</Link>
        <time className={`blog__jumbotron__latest-featured-article__date`}
              dateTime={publishDate}>
          {localizeDate({ date: publishDate, locale })}
        </time>
        <Link to={`/blog${slug}`}
              className={`blog__jumbotron__latest-featured-article__cta`}>{latestFeaturedArticleCta}</Link>
      </div>
      <div className={`blog__jumbotron__latest-featured-article__share`}>
        <p className={`blog__jumbotron__latest-featured-article__share__title`}>{socialNetworkCta}</p>
        <ul className={`blog__jumbotron__latest-featured-article__share__list`}>
          {availableSocialNetworks.urls.map((url, index) => {
            let name = availableSocialNetworks.names[index];

            return <li key={name} className={`blog__jumbotron__latest-featured-article__share__item`}>
              <a className={`blog__jumbotron__latest-featured-article__share__link`} href={url} target={`_blank`} rel={`noopener noreferer`}>{name}</a>
            </li>;
          })}
        </ul>
      </div>
    </div>
  </section>;
};

BlogJumbotron.propTypes = {
  blog: PropTypes.arrayOf(String).isRequired,
  location: PropTypes.arrayOf(String),
  latestFeaturedArticle: PropTypes.arrayOf(String).isRequired
};

BlogJumbotron.defaultProps = {};

export default BlogJumbotron;
