import { useEffect } from 'react';
import { toggleMenu } from '@components/organisms/header/utils/toggleMenu';
import { scrollDirection } from '@components/organisms/header/utils/scrollDirection';

const ReactScriptProvider = () => {
  useEffect(() => {
    toggleMenu();
    scrollDirection();
  }, []);

  return null;
};

export default ReactScriptProvider;
