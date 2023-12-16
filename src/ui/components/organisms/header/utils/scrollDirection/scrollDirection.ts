enum ScrollDirection {
  NONE = 'NONE',
  UP = 'UP',
  DOWN = 'DOWN',
}
export function scrollDirection(): void {
  let lastScrollTop = 0;
  let scrollDirection: ScrollDirection = ScrollDirection.NONE;

  const handleScroll = () => {
    const HEADER = document.querySelector('header');
    const LOGO = document.querySelector('.site__logo');
    const scrollTop = document.documentElement.scrollTop ?? document.body.scrollTop;

    if (scrollTop > lastScrollTop) scrollDirection = ScrollDirection.DOWN;
    else scrollDirection = ScrollDirection.UP;

    lastScrollTop = scrollTop;

    if (!HEADER || !LOGO) return;

    if (scrollTop === 0) {
      HEADER.classList.remove('--is-scrolling');
      LOGO.classList.remove('--is-scrolling');
    } else if (scrollDirection === ScrollDirection.DOWN) {
      HEADER.classList.add('--is-scrolling');
      LOGO.classList.add('--is-scrolling');
    }
  };

  window.addEventListener('scroll', handleScroll);
}
