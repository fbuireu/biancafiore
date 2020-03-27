import React from 'react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import { useMenuItems } from '../../../hooks/useMenuItems';

const Navigation = () => {
  const menuItems = useMenuItems();

  return <nav>
    <ul>
      {menuItems.map(({ node }) => <li key={node.frontmatter.position}><Link to={node.fields.slug}>{node.frontmatter.name}</Link></li>)}
    </ul>
  </nav>;
};

Navigation.propTypes = {
  menuItems: PropTypes.object,
};

Navigation.defaultProps = {
  menuItems: ``,
};

export default Navigation;
