import PropTypes from 'prop-types';
import React from 'react';
import Hamburger from '../../../assets/svg-components/menu.svg';
import './HamburgerMenu.scss';

const HamburgerMenu = ({ toggleMenuVisibility, isMenuActive }) => {
  return <Hamburger className={`hamburger-menu ${isMenuActive ? `--is-active` : ``}`} onClick={toggleMenuVisibility} />;
};

HamburgerMenu.propTypes = {
  toggleMenuVisibility: PropTypes.func.isRequired,
  isMenuActive: PropTypes.bool.isRequired
};

HamburgerMenu.defaultProps = {};

export default HamburgerMenu;