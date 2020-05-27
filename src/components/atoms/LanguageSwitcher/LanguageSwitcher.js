import { changeLocale, FormattedMessage, IntlContextConsumer } from 'gatsby-plugin-intl';
import React, { useState } from 'react';
import ArrowDown from '../../../assets/svg/arrow-down.svg';
import { useLanguages } from '../../../hooks/useLanguages';
import './LanguageSwitcher.scss';

export const LanguageSwitcher = () => {
  const [isMenuSelectorOpen, setIsMenuSelectorOpen] = useState(false),
    languages = useLanguages();

  const handleMenuSelector = () => setIsMenuSelectorOpen(!isMenuSelectorOpen),
    handleLanguage = language => changeLocale(language);

  return <li className={`language-switcher__wrapper ${isMenuSelectorOpen ? `--is-open` : ``}`}>
    <span onClick={handleMenuSelector}>
      <FormattedMessage id={`global.changeLanguage`} />
      <ArrowDown className={`arrow-down`} />
    </span>
    <ul className={`language-switcher__list`}>
      {languages.map((language, index) => isMenuSelectorOpen &&
        <IntlContextConsumer>
          {({ language: currentLanguage }) =>
            <li className={`language-switcher__item ${currentLanguage === language.isoCode ? `--is-current-language` : ``}`}
                onClick={() => handleLanguage(language.isoCode)}
                key={index}>
              <FormattedMessage id={`global.${language.isoCode}`} />
            </li>
          }
        </IntlContextConsumer>,
      )}
    </ul>
  </li>;
};