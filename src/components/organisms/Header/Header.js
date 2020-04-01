import PropTypes from 'prop-types';
import React from 'react';
import Navigation from '../../molecules/Navigation/Navigation';
import './Header.scss';

const Header = ({ siteTitle }) => (
  <header>
    <section className={`main-wrapper`}>
      {siteTitle}
      <Navigation />
    </section>
  </header>
);

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: `Bianca Fiore`,
};

export default Header;
