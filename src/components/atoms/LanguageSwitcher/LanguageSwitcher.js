import { changeLocale, FormattedMessage } from 'gatsby-plugin-intl';
import React, { useEffect, useState } from 'react';
import DownArrow from '../../../assets/svg/down_arrow.svg';
import { useLanguages } from '../../../hooks/useLanguages';
import './LanguageSwitcher.scss';

export const LanguageSwitcher = () => {
  const [isMenuSelectorOpen, setIsMenuSelectorOpen] = useState(false),
    [currentLanguage, setCurrentLanguage] = useState(undefined),
    languages = useLanguages();

  useEffect(() => setCurrentLanguage(localStorage.getItem(`gatsby-intl-language`)), []);

  return <li className={`language-switcher__wrapper ${isMenuSelectorOpen ? `--is-open` : ``}`}>
    <span onClick={() => setIsMenuSelectorOpen(!isMenuSelectorOpen)}>
      <FormattedMessage id={`changeLanguage`} />
      <DownArrow />
    </span>
    <ul className={`language-switcher__list`}>
      {languages.map((language, index) => isMenuSelectorOpen &&
        <li className={`language-switcher__item ${currentLanguage === language.iso ? `--is-current-language` : ``}`}
            onClick={() => changeLocale(language.iso)}
            key={index}>
          <FormattedMessage id={language.iso} />
        </li>)}
    </ul>
  </li>;
};