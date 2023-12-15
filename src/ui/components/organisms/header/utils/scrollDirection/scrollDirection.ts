enum ScrollDirection {
  NONE = 'NONE',
  UP = 'UP',
  DOWN = 'DOWN',
}

interface ScrollDirectionOptions {
  target: string;
}

export function scrollDirection(options: ScrollDirectionOptions): void {
  let lastScrollTop = 0;
  let scrollDirection: ScrollDirection = ScrollDirection.NONE;

  const handleScroll = () => {
    const { target } = options;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    if (scrollTop > lastScrollTop) scrollDirection = ScrollDirection.DOWN;
    else scrollDirection = ScrollDirection.UP;

    lastScrollTop = scrollTop;

    const selector = document.querySelector(target);
    if (selector) {
      if (scrollTop === 0) selector.classList.remove('--is-scrolling');
      else if (scrollDirection === ScrollDirection.DOWN) selector.classList.add('--is-scrolling');
    }
  };

  window.addEventListener('scroll', handleScroll);
}
