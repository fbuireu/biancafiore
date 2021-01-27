import { Link } from 'gatsby';
import { useIntl } from 'gatsby-plugin-intl';
import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { useMenuItems } from '../../../utils/hooks/useMenuItems';
import { useNavigation } from '../../../utils/hooks/useNavigation';
import { useOutsideClick } from '../../../utils/hooks/useOutsideClick';
import LanguageSwitcher from '../../molecules/LanguageSwitcher/LanguageSwitcher';
import './Navigation.scss';

const Navigation = ({ isMenuActive, toggleMenuVisibility }) => {
  const menuItems = useMenuItems();
  const navigation = useNavigation();
  const navigationReference = useRef(null);
  const { locale: currentLanguage } = useIntl();

  const NAVIGATION_DATA = {
    description: navigation[0]?.node?.html,
    link: []
  };

  menuItems.map(({ node: menuItem }) => {
    let { frontmatter: { name } } = menuItem;
    let { node: { frontmatter: { menuItems } } } = navigation[0];

    if (menuItems.includes(name)) NAVIGATION_DATA.link.push(menuItem);

    return NAVIGATION_DATA;
  });

  useOutsideClick(navigationReference, () => isMenuActive && toggleMenuVisibility());

  return <div ref={navigationReference} className={`navigation__wrapper wrapper ${isMenuActive ? `--is-visible` : ``}`}>
    <div className={`navigation__wrapper__inner`}>
      <Markdown className={`navigation__wrapper__body`}>{NAVIGATION_DATA.description}</Markdown>
      <nav className={`navigation__navbar`}>
        <ul className={`navigation__list`}>
          {NAVIGATION_DATA.link.map(navigationElement => {
            let { frontmatter: { position, name }, fields: { slug } } = navigationElement;

            return <li key={position} className={`navigation__item`}>
              <Link to={`/${currentLanguage}${slug}`}
                    className={`navigation__item__link`}
                    activeClassName={`--is-active`}
                    partiallyActive={true}>{name}</Link>
            </li>;
          })}
          <LanguageSwitcher />
        </ul>
      </nav>
    </div>
  </div>;
};

Navigation.propTypes = {
  isMenuActive: PropTypes.bool.isRequired,
  toggleMenuVisibility: PropTypes.func.isRequired
};

Navigation.defaultProps = {};

export default Navigation;
