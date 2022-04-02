import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import 'swiper/swiper.scss';
import { useLatestProjects } from '../../../utils/hooks/useLatestProjects';
import slugify from '../../../utils/slugify/slugify';
import './MyWork.scss';

const MyWork = ({ title }) => {
  const latestProjects = useLatestProjects();
  const { locale } = useIntl();

  return <section className={`my-work__wrapper wrapper`}>
    <h2 className={`my-work__title`}>{title}</h2>
    <ul className={`my-work__list`}>
      {latestProjects.map(({ node: latestProject }) => {
        return <Link
          className={`my-work__item`}
          key={latestProject.frontmatter.content.name}
          to={`/${locale}/projects/${slugify(latestProject.frontmatter.content.name)}`}
        >
          <Img
            className={`my-work__item__image`}
            fluid={latestProject.frontmatter.content.featuredImage.childImageSharp.fluid}
            alt={latestProject.frontmatter.content.name}
          />
          <h3 className={`my-work__item__name`}>{latestProject.frontmatter.content.name}</h3>
        </Link>;
      })}
    </ul>
  </section>;
};

MyWork.propTypes = {
  title: PropTypes.string.isRequired,
  works: PropTypes.arrayOf(PropTypes.object).isRequired
};

MyWork.defaultProps = {};

export default MyWork;
