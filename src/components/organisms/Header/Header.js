import { useState } from 'react';
import { useScrollPosition } from '../../../utils/hooks/useScrollPosition';
import HamburgerMenu from '../../atoms/HamburgerMenu/HamburgerMenu';
import Navigation from '../Navigation/Navigation';
import './Header.scss';

const Header = () => {
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const toggleMenuVisibility = () => setIsMenuActive(!isMenuActive);

  useScrollPosition(function setScrollPosition ({ currentPosition }) {
    let { y: currentVerticalYPosition } = currentPosition;

    setIsScrolling(Math.abs(currentVerticalYPosition) > 0);
  });

  return <header className={`${isScrolling ? `--is-scrolling` : ``}`}>
    <section className={`wrapper`}>
      <span>Logo</span>
      <HamburgerMenu toggleMenuVisibility={toggleMenuVisibility} isMenuActive={isMenuActive} />
      <Navigation toggleMenuVisibility={toggleMenuVisibility} isMenuActive={isMenuActive} />
    </section>
  </header>;
};

Header.propTypes = {
};

Header.defaultProps = {
};

export default Header;
