import { Link } from 'gatsby';
import { IntlContextConsumer } from 'gatsby-plugin-intl';
import React from 'react';
import { useMenuItems } from '../../../hooks/useMenuItems';
import { LanguageSwitcher } from '../../atoms/LanguageSwitcher/LanguageSwitcher';
import './Navigation.scss';

const Navigation = () => {
  const menuItems = useMenuItems();

  return <nav>
    <ul>
      <IntlContextConsumer>
        {({ language: currentLocale }) =>
          menuItems.map(
            ({ node }) => <li key={node.frontmatter.position}><Link to={`/${currentLocale}/${node.fields.slug}`}>{node.frontmatter.name}</Link></li>)
        }
      </IntlContextConsumer>
      <LanguageSwitcher />
    </ul>
  </nav>;
};

export default Navigation;
