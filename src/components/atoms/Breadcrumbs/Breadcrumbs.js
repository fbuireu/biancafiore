import { Link } from 'gatsby';
import { useIntl } from 'gatsby-plugin-intl';
import path from 'path';
import PropTypes from 'prop-types';
import { capitalizy } from '../../../utils/capitalizy/capitalizy';
import './Breadcrumbs.scss';

const HOMEPAGE_PATH = [`/`];

const Breadcrumbs = ({ location, breadcrumbLabel = null }) => {
  const { locale: currentLanguage } = useIntl();

  let linkPath = ``;
  const breadcrumbs = HOMEPAGE_PATH.concat(location.pathname.split(`/`).filter(routeName => routeName !== `` && routeName !== currentLanguage));

  const lastPage = breadcrumbs.length > 0 ? breadcrumbs.length - 1 : 0;

  return (
    <nav aria-label={`Breadcrumb`} className={`breadcrumbs`}>
      <ol className={`breadcrumbs__list`}>
        {breadcrumbs.map((breadcrumb, index) => {
          linkPath = path.join(index === 0 ? `/${currentLanguage}/${linkPath}` : `/${linkPath}`, `${breadcrumb}/`);
          let isSameName = capitalizy(breadcrumb).toUpperCase() === breadcrumbLabel?.toUpperCase();
          let isHome = breadcrumb === `/`;

          if (isHome) breadcrumb = `Home`;
          else if (isSameName) breadcrumb = breadcrumbLabel;
          else breadcrumb = capitalizy(breadcrumb);

          return <>
            {index !== lastPage ? (
              <li key={breadcrumb} className={`breadcrumb__item`}>
                <Link to={linkPath} className={`breadcrumb__item__link`}>{breadcrumb}</Link>
                <span aria-hidden={true} className={`breadcrumb__item__separator`}>/</span>
              </li>
            ) : (
              <li key={breadcrumb} className={`breadcrumb__item--is-current`} aria-current={`page`}><strong>{breadcrumb}</strong></li>
            )}
          </>;
        })}
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  location: PropTypes.string.isRequired,
  breadcrumbLabel: PropTypes.string
};

Breadcrumbs.defaultProps = {};

export default Breadcrumbs;