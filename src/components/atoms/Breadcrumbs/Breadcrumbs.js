import { Link } from 'gatsby';
import { useIntl } from 'gatsby-plugin-intl';
import path from 'path';
import PropTypes from 'prop-types';

const homePagePath = [`/`];

const Breadcrumbs = ({ location }) => {
  const { locale: currentLanguage } = useIntl();
  let linkPath = ``;

  const breadcrumbs = homePagePath.concat(location.pathname.split(`/`).filter(routeName => routeName !== `` && routeName !== currentLanguage));

  const lastPage = breadcrumbs.length > 0 ? breadcrumbs.length - 1 : 0;

  function capitalizeSlug(slug) {
    return slug
      .split(`-`)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(` `);
  }

  return (
    <nav aria-label={`Breadcrumb`}>
      {breadcrumbs.map((page, index) => {
        linkPath = path.join(index === 0 ? `/${currentLanguage}/${linkPath}` : `/${linkPath}`, `${page}/`);
        page = page === `/` ? `Home` : capitalizeSlug(page);

        return (
          <ol key={page}>
            {index !== lastPage ? (
              <li>
                <Link to={linkPath}>{page}</Link>
                <span aria-hidden={true}>&gt;</span>
              </li>
            ) : (
              <li aria-current={`page`}>{page}</li>
            )}
          </ol>
        );
      })}
    </nav>
  );
};

Breadcrumbs.propTypes = {
  location: PropTypes.string.isRequired
};

Breadcrumbs.defaultProps = {};

export default Breadcrumbs;