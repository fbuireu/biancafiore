import { useEffect } from 'react';
import { toggleMenu } from '@components/organisms/header/utils/toggleMenu';
import { scrollDirection } from '@components/organisms/header/utils/scrollDirection';
import { initializeParallax } from '@components/molecules/welcome/utils/initializeParallax';

const ReactScriptProvider = () => {
  useEffect(() => {
    toggleMenu();
    scrollDirection();
    initializeParallax();
  }, []);

  return null;
};

export default ReactScriptProvider;
