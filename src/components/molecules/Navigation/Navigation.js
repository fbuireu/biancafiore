import { Link } from 'gatsby';
import { IntlContextConsumer } from 'gatsby-plugin-intl';
import React from 'react';
import { useMenuItems } from '../../../utils/hooks/useMenuItems';
import { LanguageSwitcher } from '../../atoms/LanguageSwitcher/LanguageSwitcher';
import './Navigation.scss';

const Navigation = () => {
  const menuItems = useMenuItems();

  return <nav>
    <ul className={`navigation__list`}>
      <IntlContextConsumer>
        {({ language: currentLanguage }) =>
          menuItems.map(
            ({ node: menuItem }) => <li key={menuItem.frontmatter.position} className={`navigation__item`}>
              <Link to={`/${currentLanguage}${menuItem.fields.slug}`}
                    className={`navigation__item__link`}
                    activeClassName={`--is-active`}
                    partiallyActive={true}>{menuItem.frontmatter.name}</Link>
            </li>)
        }
      </IntlContextConsumer>
      <LanguageSwitcher />
    </ul>
  </nav>;
};

export default Navigation;
