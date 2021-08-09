import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { useIntl } from 'gatsby-plugin-intl';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import { useSocialNetworkItems } from '../../../utils/hooks/useSocialNetworkItems';
import slugify from '../../../utils/slugify/slugify';
import './BlogJumbotron.scss';

const BlogJumbotron = ({
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
  const { locale: currentLanguage } = useIntl();

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
                <Link to={`/${currentLanguage}/tag/${slugify(tag)}`}>#{tag}</Link>
              </li>)
            )}
          </ul>
        </div>
        <h2 className={`blog__jumbotron__latest-featured-article__title`}>{latestFeaturedArticleTitle}</h2>
        <Link className={`blog__jumbotron__latest-featured-article__author`}
              to={`/${currentLanguage}/tag/${slugify(author)}`}>{author}</Link>
        <time className={`blog__jumbotron__latest-featured-article__date`}
              dateTime={publishDate}>
          {moment(new Date(publishDate))
            .locale(currentLanguage)
            .format(`LL`)
          }
        </time>
        <Link to={`/${currentLanguage}${slug}`}
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
  latestFeaturedArticle: PropTypes.arrayOf(String).isRequired
};

BlogJumbotron.defaultProps = {};

export default BlogJumbotron;
