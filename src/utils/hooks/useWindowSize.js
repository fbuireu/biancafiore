import { useCallback, useEffect, useState } from 'react';

export const useWindowSize = () => {
  const isClient = typeof window === `object`;

  const getWindowSize = useCallback(() => {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
    };
  }, [isClient]);

  const [windowSize, setWindowSize] = useState(getWindowSize);

  useEffect(function onChangeWindowSize() {
    if (!isClient) return false;

    const onResize = () => setWindowSize(getWindowSize());

    window.addEventListener(`resize`, onResize);

    return () => window.removeEventListener(`resize`, onResize);
  }, [getWindowSize, isClient]);

  return windowSize;
};