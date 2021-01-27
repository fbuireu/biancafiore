import React, { useState } from 'react';
import HamburgerMenu from '../../atoms/HamburgerMenu/HamburgerMenu';
import Navigation from '../Navigation/Navigation';
import './Header.scss';

const Header = () => {
  const [isMenuActive, setIsMenuActive] = useState(false);

  const toggleMenuVisibility = () => setIsMenuActive(!isMenuActive);

  return <header>
    <section className={`wrapper`}>
      Logo
      <HamburgerMenu toggleMenuVisibility={toggleMenuVisibility} isMenuActive={isMenuActive}/>
      <Navigation isMenuActive={isMenuActive} toggleMenuVisibility={toggleMenuVisibility}/>
    </section>
  </header>;
};

Header.propTypes = {
};

Header.defaultProps = {
};

export default Header;
