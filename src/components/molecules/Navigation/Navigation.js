import { Link } from 'gatsby';
import { useIntl } from 'gatsby-plugin-intl';
import React from 'react';
import { useMenuItems } from '../../../utils/hooks/useMenuItems';
import LanguageSwitcher from '../../atoms/LanguageSwitcher/LanguageSwitcher';
import './Navigation.scss';

const Navigation = () => {
  const menuItems = useMenuItems();
  const { locale: currentLanguage } = useIntl();

  return <nav>
    <ul className={`navigation__list`}>
      {menuItems.map(({ node: menuItem }) => {
        return <li key={menuItem.frontmatter.position} className={`navigation__item`}>
          <Link to={`/${currentLanguage}${menuItem.fields.slug}`}
                className={`navigation__item__link`}
                activeClassName={`--is-active`}
                partiallyActive={true}>{menuItem.frontmatter.name}</Link>
        </li>;
      })}
      <LanguageSwitcher />
    </ul>
  </nav>;
};

export default Navigation;
