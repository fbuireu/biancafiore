import { gsap } from 'gsap';

const ANIMATION_CONFIG = {
  POWER4_IN_OUT: 'power4.inOut',
  POWER2_EASE_OUT: 'power2.easeOut',
  POWER2_EASE_IN: 'power2.easeIn',
  POWER3_OUT: 'power3.out',
  WHITE: getComputedStyle(document.documentElement).getPropertyValue('--white') ?? 'var(--white)',
  PATH_START: 'M0 502S175 272 500 272s500 230 500 230V0H0Z',
  PATH_END: 'M0,1005S175,995,500,995s500,5,500,5V0H0Z',
};

export function toggleMenu() {
  let isMenuOpen = false;
  let toggleMenuText = 'Menu';

  const BODY = document.querySelector('body')!;
  const HTML = document.querySelector('html')!;
  const MENU_OVERLAY = document.querySelector('.header__menu-overlay__wrapper')!;
  const MENU_DIVIDER = document.querySelector('.navigation__menu__divider')!;
  const TOGGLE_MENU_BUTTON = document.querySelector('.header__menu-button')!;
  const LOGO = document.querySelector('.site__logo')!;
  const MENU_TEXT = document.querySelector('.header__menu-text')!;
  const OVERLAY_PATH = MENU_OVERLAY.querySelector('path');

  const ELEMENTS_TO_TOGGLE = [BODY, HTML, LOGO, MENU_OVERLAY, MENU_DIVIDER];

  const timeline = gsap.timeline({ paused: true });
  toggleMenuItems();

  function updateButtonContent() {
    if (!MENU_TEXT) return;
    toggleMenuText = isMenuOpen ? 'Close' : 'Menu';
    const timeout = isMenuOpen ? 500 : 0;
    setTimeout(() => (MENU_TEXT.textContent = toggleMenuText), timeout);
  }

  function toggleMenuItems() {
    const { POWER4_IN_OUT, POWER2_EASE_IN, POWER3_OUT, WHITE, PATH_START, PATH_END } = ANIMATION_CONFIG;

    timeline.to('.header__menu-overlay__wrapper', { zIndex: '0', display: 'block' }, '<');
    timeline.to('.header__menu-text', {
      top: '1.5rem',
      left: '1rem',
      fontSize: '1.5rem',
      color: WHITE,
      x: 0,
      y: 0,
      ease: POWER4_IN_OUT,
      duration: 1.25,
    });
    timeline.add(() => updateButtonContent(), '<');
    timeline.to(
      '.header__menu-button__outline',
      {
        width: '90px',
        height: '90px',
        border: `1px solid ${WHITE}`,
        x: 0,
        y: 0,
        ease: POWER4_IN_OUT,
        duration: 1.25,
      },
      '<'
    );
    timeline.to('.site__logo', { y: '3rem', duration: 0.25 }, '-=0.5');
    timeline.to('.site__logo svg', { fill: WHITE, duration: 0.25 }, '<');
    timeline.to('.site__logo .--is-scrolling:not(.--is-menu-open) svg', { scale: 1 }, '<');
    timeline
      .to(OVERLAY_PATH, { attr: { d: PATH_START }, ease: POWER2_EASE_IN, duration: 0.8 }, '<')
      .to(OVERLAY_PATH, { attr: { d: PATH_END }, ease: POWER2_EASE_IN, duration: 0.8 }, '-=0.5');
    timeline.to('.header__menu', { visibility: 'visible', duration: 1 }, '-=0.5');
    timeline
      .to(
        '.navigation__menu__item > *',
        {
          top: 0,
          ease: POWER3_OUT,
          stagger: { amount: 0.5 },
          duration: 1,
        },
        '-=1'
      )
      .reverse();
    timeline
      .to(
        '.navigation__menu__quote > *',
        {
          top: 0,
          ease: POWER3_OUT,
          stagger: { amount: 0.5 },
          duration: 1,
        },
        '-=1'
      )
      .reverse();
  }

  TOGGLE_MENU_BUTTON.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;

    ELEMENTS_TO_TOGGLE.forEach((element) => element.classList.toggle('--is-menu-open'));

    timeline.reversed(!timeline.reversed());
  });
}
