import { changeLocale, FormattedMessage } from 'gatsby-plugin-intl';
import React, { useEffect, useState } from 'react';
import ArrowDown from '../../../assets/svg/arrow-down.svg';
import { useLanguages } from '../../../hooks/useLanguages';
import './LanguageSwitcher.scss';

export const LanguageSwitcher = () => {
  const [isMenuSelectorOpen, setIsMenuSelectorOpen] = useState(false),
    [currentLanguage, setCurrentLanguage] = useState(undefined),
    languages = useLanguages();

  useEffect(() => setCurrentLanguage(localStorage.getItem(`gatsby-intl-language`)), []);

  return <li className={`language-switcher__wrapper ${isMenuSelectorOpen ? `--is-open` : ``}`}>
    <span onClick={() => setIsMenuSelectorOpen(!isMenuSelectorOpen)}>
      <FormattedMessage id={`global.changeLanguage`} />
      <ArrowDown className={`arrow-down`} />
    </span>
    <ul className={`language-switcher__list`}>
      {languages.map((language, index) => isMenuSelectorOpen &&
        <li className={`language-switcher__item ${currentLanguage === language.isoCode ? `--is-current-language` : ``}`}
            onClick={() => changeLocale(language.isoCode)}
            key={index}>
          <FormattedMessage id={`global.${language.isoCode}`} />
        </li>)}
    </ul>
  </li>;
};