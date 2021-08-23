import { Link } from 'gatsby';
import { useIntl } from 'gatsby-plugin-intl';
import path from 'path';
import PropTypes from 'prop-types';
import { capitalizy } from '../../../utils/capitalizy/capitalizy';
import './Breadcrumbs.scss';

const HOMEPAGE_PATH = [`/`];

const Breadcrumbs = ({ location, customBreadcrumb = null, classNames }) => {
  const { locale: currentLanguage } = useIntl();
  let linkPath = ``;

  const breadcrumbs = HOMEPAGE_PATH.concat(location.pathname.split(`/`).filter(routeName => routeName !== `` && routeName !== currentLanguage));

  const lastPage = breadcrumbs.length > 0 ? breadcrumbs.length - 1 : 0;

  return (
    <nav aria-label={`Breadcrumb`} className={`breadcrumbs ${classNames}`}>
      <ol className={`breadcrumbs__list`}>
        {breadcrumbs.map((breadcrumb, index) => {
          linkPath = path.join(index === 0 ? `/${currentLanguage}/${linkPath}` : `/${linkPath}`, `${breadcrumb}/`);
          let isHome = breadcrumb === `/`;

          if (customBreadcrumb?.position - 1 === index) breadcrumb = customBreadcrumb.label;
          else if (isHome) breadcrumb = `Home`;
          else breadcrumb = capitalizy(breadcrumb);

          return <>
            {index !== lastPage ? (
              <li key={breadcrumb} className={`breadcrumb__item`}>
                <Link to={linkPath} className={`breadcrumb__item__link`}>{breadcrumb}</Link>
                <span aria-hidden={true} className={`breadcrumb__item__separator`}>/</span>
              </li>
            ) : (
              <li key={breadcrumb} className={`breadcrumb__item--is-current`} aria-current={`page`}>
                <strong>{breadcrumb}</strong>
              </li>
            )}
          </>;
        })}
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  location: PropTypes.string.isRequired,
  customBreadcrumb: PropTypes.string,
  classNames: PropTypes.string
};

Breadcrumbs.defaultProps = {};

export default Breadcrumbs;