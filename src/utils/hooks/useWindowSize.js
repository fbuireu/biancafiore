import { useEffect, useState } from 'react';

export const useWindowSize = () => {
  const isClient = typeof window === `object`;

  const getWindowSize = () => {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  };

  const [windowSize, setWindowSize] = useState(getWindowSize);

  useEffect(() => {
    if (!isClient) return false;

    const handleResize = () => setWindowSize(getWindowSize());

    window.addEventListener(`resize`, handleResize);

    return () => window.removeEventListener(`resize`, handleResize);
  }, []);

  return windowSize;
};