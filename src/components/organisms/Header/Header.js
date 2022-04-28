import { Link } from 'gatsby-plugin-intl';
import { useEffect, useState } from 'react';
import Logo from '../../../assets/svg-components/logo.svg';
import { useScrollPosition } from '../../../utils/hooks/useScrollPosition';
import HamburgerMenu from '../../atoms/HamburgerMenu/HamburgerMenu';
import Navigation from '../Navigation/Navigation';
import './Header.scss';

const Header = () => {
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const toggleMenuVisibility = () => setIsMenuActive(!isMenuActive);

  useEffect(() => {
    if (isMenuActive) document.documentElement.classList.add(`--is-menu-open`);
    else document.documentElement.classList.remove(`--is-menu-open`);

    return () => document.documentElement.classList.remove(`--is-menu-open`);
  }, [isMenuActive]);

  useScrollPosition(function setScrollPosition({ currentPosition }) {
    let { y: currentVerticalYPosition } = currentPosition;

    setIsScrolling(Math.abs(currentVerticalYPosition) > 0);
  });

  return <header className={`${isScrolling ? `--is-scrolling` : ``}`}>
    <section className={`wrapper`}>
      <Link className={`logo__link ${isMenuActive ? `--is-active` : ``}`} to={`/`}>
        <Logo className={`logo`} />
      </Link>
      <HamburgerMenu onClick={toggleMenuVisibility} isMenuActive={isMenuActive} />
      <Navigation onClick={toggleMenuVisibility} isMenuActive={isMenuActive} />
    </section>
  </header>;
};

Header.propTypes = {
};

Header.defaultProps = {
};

export default Header;
