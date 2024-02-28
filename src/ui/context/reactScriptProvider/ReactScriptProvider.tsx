import { useEffect } from 'react';
import { toggleMenu } from '@components/organisms/header/utils/toggleMenu';
import { scrollDirection } from '@components/organisms/header/utils/scrollDirection';
import { initializeParallax } from '@components/molecules/welcome/utils/initializeParallax';
import { backgroundObserver } from '@components/organisms/header/utils/backgroundObserver';
import { mailTo } from '@shared/utils/mailTo';
import { initTabs } from '@components/organisms/tabs/utils/changeTab';

const ReactScriptProvider = () => {
    useEffect(() => {
        toggleMenu();
        scrollDirection();
        initializeParallax();
        backgroundObserver();
        mailTo();
        initTabs();
    }, []);

    return null;
};

export default ReactScriptProvider;
