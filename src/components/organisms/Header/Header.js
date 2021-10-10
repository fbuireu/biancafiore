import { Link } from 'gatsby-plugin-intl';
import { useState } from 'react';
import Logo from '../../../assets/svg-components/logo.svg';
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
      <Link className={`logo__link ${isMenuActive ? `--is-active` : ``}`} to={`/`}>
        <Logo className={`logo`} />
      </Link>
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
