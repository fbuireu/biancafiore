import React, { useState } from 'react';
import { changeLocale, FormattedMessage } from 'gatsby-plugin-intl';
import { useLanguages } from '../../../hooks/useLanguages';
import DownArrow from '../../../assets/svg/down_arrow.svg';
import './LanguageSwitcher.scss';

export const LanguageSwitcher = () => {
  const [isMenuSelectorOpen, setIsMenuSelectorOpen] = useState(false),
    languages = useLanguages();

  return <li className={`language-switcher__wrapper ${isMenuSelectorOpen ? `--is-open` : ``}`}>
    <span onClick={() => setIsMenuSelectorOpen(!isMenuSelectorOpen)}>
      <FormattedMessage id={`changeLanguage`} />
      <DownArrow />
    </span>
    <ul className={`language-switcher__list`}>
      {languages.map((language, index) => isMenuSelectorOpen &&
        <li className={`language-switcher__item`} key={index} onClick={() => changeLocale(language.iso)}>{language.name}</li>)}
    </ul>
  </li>;
};