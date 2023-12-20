import { useEffect } from 'react';
import { toggleMenu } from '@components/organisms/header/utils/toggleMenu';
import { scrollDirection } from '@components/organisms/header/utils/scrollDirection';
import { initializeParallax } from '@components/molecules/welcome/utils/initializeParallax';
import { intersectionObserver } from 'src/ui/components/organisms/header/utils/intersectionObserver';

const ReactScriptProvider = () => {
    useEffect(() => {
        toggleMenu();
        scrollDirection();
        initializeParallax();
        intersectionObserver();
    }, []);

    return null;
};

export default ReactScriptProvider;
