import PropTypes from 'prop-types';
import Hamburger from '../../../assets/svg-components/menu.svg';
import './HamburgerMenu.scss';

const HamburgerMenu = ({ onClick, isMenuActive }) => {
  return <Hamburger className={`hamburger-menu ${isMenuActive ? `--is-active` : ``}`} onClick={onClick} />;
};

HamburgerMenu.propTypes = {
  onClick: PropTypes.func.isRequired,
  isMenuActive: PropTypes.bool.isRequired
};

HamburgerMenu.defaultProps = {};

export default HamburgerMenu;