import { useLayoutEffect, useRef } from 'react';

const isBrowser = typeof window !== `undefined`;

const getScrollPosition = ({ element, useWindow }) => {
  if (!isBrowser) return { x: 0, y: 0 };

  const target = element ? element.current : document.body,
    position = target.getBoundingClientRect();

  return useWindow
    ? { x: window.scrollX, y: window.scrollY }
    : { x: position.left, y: position.top };
};

export const useScrollPosition = (effect, deps, element, useWindow, wait) => {
  const position = useRef(getScrollPosition({ useWindow }));
  let throttleTimeout = null;

  const callBack = () => {
    const currentPosition = getScrollPosition({ element, useWindow });

    effect({ previousPosition: position.current, currentPosition: currentPosition });
    position.current = currentPosition;
    throttleTimeout = null;
  };

  useLayoutEffect(() => {
    const handleScroll = () => {
      if (wait && !throttleTimeout) throttleTimeout = setTimeout(callBack, wait);
      else callBack();
    };

    window.addEventListener(`scroll`, handleScroll);

    return () => window.removeEventListener(`scroll`, handleScroll);
  }, deps);
};