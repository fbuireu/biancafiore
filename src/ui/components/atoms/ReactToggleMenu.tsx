import { useEffect } from 'react';
import { toggleMenu } from '@components/organisms/header/utils/toggleMenu.ts';

const ReactToggleMenu = () => {
  useEffect(() => {
    toggleMenu();
  }, []);

  return null;
};

export default ReactToggleMenu;
