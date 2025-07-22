import { gsap, Power2, Power3, Power4 } from 'gsap'
import { backgroundObserver } from '../../utils/backgroundObserver'

const ANIMATION_CONFIG = {
  POWER4_IN_OUT: Power4.easeInOut,
  POWER2_EASE_OUT: Power2.easeOut,
  POWER2_EASE_IN: Power2.easeIn,
  POWER3_OUT: Power3.easeOut,
  PATH_START: 'M0 502S175 272 500 272s500 230 500 230V0H0Z',
  PATH_END: 'M0,1005S175,995,500,995s500,5,500,5V0H0Z',
}

const SELECTORS = {
  BODY: 'body',
  HTML: 'html',
  TOGGLE_MENU_BUTTON: '.header__menu-button',
  MENU_OVERLAY: '.header__menu-overlay-wrapper',
  OVERLAY_PATH: '.header__menu-overlay-wrapper path',
  HEADER_MENU_TEXT: '.header__menu-text',
  BUTTON_OUTLINE: '.header__menu-button__outline',
  SITE_LOGO: '.site__logo',
  SITE_LOGO_SVG: '.site__logo svg',
  HEADER_MENU: '.header__menu',
  NAVIGATION_DIVIDER: '.navigation__menu__divider',
  NAVIGATION_ITEMS: '.navigation__menu__item > *',
  QUOTE: '.navigation__menu__quote > *',
  READING_PROGRESS: '.reading-progress',
}

export function toggleMenu (): void {
  let isMenuOpen = false
  let toggleMenuText = 'Menu'
  const timeline = gsap.timeline({ paused: true })
  timeline.eventCallback('onReverseComplete', () => backgroundObserver())

  const {
    BODY: BODY_SELECTOR,
    HTML: HTML_SELECTOR,
    TOGGLE_MENU_BUTTON: TOGGLE_MENU_BUTTON_SELECTOR,
    MENU_OVERLAY,
    OVERLAY_PATH,
    BUTTON_OUTLINE,
    SITE_LOGO,
    NAVIGATION_DIVIDER,
    HEADER_MENU,
    NAVIGATION_ITEMS,
    QUOTE,
    HEADER_MENU_TEXT,
    READING_PROGRESS: READING_PROGRESS_SELECTOR,
    SITE_LOGO_SVG
  } = SELECTORS

  const BODY = document.querySelector(BODY_SELECTOR) as HTMLBodyElement
  const HTML = document.querySelector(HTML_SELECTOR) as HTMLHtmlElement
  const LOGO = document.querySelector(SITE_LOGO) as HTMLElement
  const TOGGLE_MENU_BUTTON = document.querySelector(TOGGLE_MENU_BUTTON_SELECTOR) as HTMLElement
  const MENU_DIVIDER = document.querySelector(NAVIGATION_DIVIDER) as HTMLElement
  const MENU_TEXT = document.querySelector(HEADER_MENU_TEXT) as HTMLElement
  const LOGO_SVG = document.querySelector(SITE_LOGO_SVG) as HTMLElement
  const READING_PROGRESS = document.querySelector(READING_PROGRESS_SELECTOR) as HTMLElement

  const ELEMENTS_TO_TOGGLE = [BODY, HTML, LOGO, MENU_DIVIDER, TOGGLE_MENU_BUTTON, LOGO_SVG, READING_PROGRESS]

  const toggleMenuItems = (): void => {
    const { POWER4_IN_OUT, POWER2_EASE_IN, POWER2_EASE_OUT, POWER3_OUT, PATH_START, PATH_END } = ANIMATION_CONFIG

    timeline.to(MENU_OVERLAY, { display: 'block' })
    timeline.to(
      MENU_TEXT,
      {
        top: '1.75rem',
        left: '1.25rem',
        fontSize: '1.5rem',
        x: '-1rem',
        y: 0,
        ease: POWER4_IN_OUT,
        duration: 1,
      },
      '<',
    )
    timeline.add(() => updateButton(), '<')
    timeline.to(
      BUTTON_OUTLINE,
      {
        width: '90px',
        height: '90px',
        x: '-1rem',
        y: 0,
        ease: POWER4_IN_OUT,
        duration: 1,
      },
      '<',
    )
    timeline
      .to(OVERLAY_PATH, { attr: { d: PATH_START }, ease: POWER2_EASE_IN, duration: 1 }, '<')
      .to(OVERLAY_PATH, { attr: { d: PATH_END }, ease: POWER2_EASE_OUT, duration: 1 }, '-=0.5')
    timeline.to(HEADER_MENU, { visibility: 'visible', duration: 1 }, '-=0.5')
    timeline
      .to(
        NAVIGATION_ITEMS,
        {
          top: 0,
          ease: POWER3_OUT,
          stagger: { amount: 0.5 },
          duration: 0.75,
        },
        '<',
      )
      .reverse()
    timeline.to(
      QUOTE,
      {
        top: 0,
        ease: POWER3_OUT,
        duration: 0.75,
      },
      '<',
    )
  }

  toggleMenuItems()

  const updateButton = (): void => {
    if (!MENU_TEXT) return

    toggleMenuText = isMenuOpen ? 'Close' : 'Menu'
    const timeout = isMenuOpen ? 500 : 0

    document.documentElement.style.overflow = isMenuOpen ? 'hidden' : 'initial'

    setTimeout(() => {
      MENU_TEXT.textContent = toggleMenuText
    }, timeout)
  }

  TOGGLE_MENU_BUTTON.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen
    timeline.reversed(!timeline.reversed())

    for (const element of ELEMENTS_TO_TOGGLE) {
      if (!element) return

      element.classList.toggle('--is-menu-open')
    }
  })
}
