import React from 'react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import Navigation from '../../molecules/Navigation/Navigation';
import './Header.scss';

const Header = ({ siteTitle }) => (
  <header>
    <div>
      <h1>
        <Link to='/'>
          <Navigation />
          {siteTitle}
        </Link>
      </h1>
    </div>
  </header>
);

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: ``,
};

export default Header;
