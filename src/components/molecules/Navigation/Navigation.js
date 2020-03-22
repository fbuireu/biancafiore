import { graphql, Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

const Navigation = () => {
  return (
    <nav>
      <ul>
        <li></li>
      </ul>
    </nav>
  );
};

// export const navigationQuery = graphql`
//     query {
//
//     }
// `;

Navigation.propTypes = {
  siteTitle: PropTypes.string,
};

Navigation.defaultProps = {
  siteTitle: ``,
};

export default Navigation;
