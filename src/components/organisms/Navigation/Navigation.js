import { Link } from 'gatsby-plugin-intl';
import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useMenuItems } from '../../../utils/hooks/useMenuItems';
import { useNavigation } from '../../../utils/hooks/useNavigation';
import { useOutsideClick } from '../../../utils/hooks/useOutsideClick';
import './Navigation.scss';

const Navigation = ({ isMenuActive, onClick }) => {
  const menuItems = useMenuItems();
  const navigation = useNavigation();
  const navigationReference = useRef(null);

  const navigationData = {
    description: navigation[0]?.node?.html,
    link: []
  };

  menuItems.map(({ node: menuItem }) => {
    let { frontmatter: { name } } = menuItem;
    let { node: { frontmatter: { menuItems } } } = navigation[0];

    if (menuItems.includes(name)) navigationData.link.push(menuItem);

    return navigationData;
  });

  useOutsideClick(navigationReference, () => isMenuActive && onClick);

  return <div ref={navigationReference} className={`navigation__wrapper wrapper ${isMenuActive ? `--is-visible` : ``}`}>
    <div className={`navigation__wrapper__inner`}>
      <Markdown className={`navigation__wrapper__body`}>{navigationData.description}</Markdown>
      <nav className={`navigation__navbar`}>
        <ul className={`navigation__list`}>
          {navigationData.link.map(navigationElement => {
            let { frontmatter: { position, name }, fields: { slug } } = navigationElement;

            return <li key={position} className={`navigation__item`}>
              <Link to={`${slug}`}
                    className={`navigation__item__link`}
                    activeClassName={`--is-active`}
                    partiallyActive={true}>
                {name}
              </Link>
            </li>;
          })}
          {/*<LanguageSwitcher />*/}
        </ul>
      </nav>
    </div>
  </div>;
};

Navigation.propTypes = {
  isMenuActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

Navigation.defaultProps = {};

export default Navigation;
