import { useEffect } from 'react';
import { toggleMenu } from '@components/organisms/header/utils/toggleMenu';
import { scrollDirection } from '@components/organisms/header/utils/scrollDirection';
import { initializeParallax } from '@components/molecules/welcome/utils/initializeParallax';
import { backgroundObserver } from 'src/ui/components/organisms/header/utils/backgroundObserver';
import { mailTo } from '@shared/utils/mailTo';

const ReactScriptProvider = () => {
    useEffect(() => {
        toggleMenu();
        scrollDirection();
        initializeParallax();
        backgroundObserver();
        mailTo();
    }, []);

    return null;
};

export default ReactScriptProvider;
