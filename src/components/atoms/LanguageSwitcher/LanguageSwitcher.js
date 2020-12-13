import { changeLocale, FormattedMessage, useIntl } from 'gatsby-plugin-intl';
import React, { useState } from 'react';
import ArrowDown from '../../../assets/svg/arrow-down.svg';
import { useLanguages } from '../../../utils/hooks/useLanguages';
import './LanguageSwitcher.scss';

const LanguageSwitcher = () => {
  const [isMenuSelectorOpen, setIsMenuSelectorOpen] = useState(false),
    languages = useLanguages();
  const { locale: currentLanguage } = useIntl();

  const handleMenuSelector = () => setIsMenuSelectorOpen(!isMenuSelectorOpen);

  const handleLanguage = language => changeLocale(language);

  return <li className={`language-switcher__wrapper ${isMenuSelectorOpen ? `--is-open` : ``}`}>
    <span onClick={handleMenuSelector}>
      <FormattedMessage id={`global.changeLanguage`} />
      <ArrowDown className={`arrow-down`} />
    </span>
    <ul className={`language-switcher__list`}>
      {languages.map(language => isMenuSelectorOpen &&
        <li className={`language-switcher__item ${currentLanguage === language.isoCode ? `--is-current-language` : ``}`}
            onClick={() => handleLanguage(language.isoCode)}>
          <FormattedMessage id={`global.${language.isoCode}`} />
        </li>
      )}
    </ul>
  </li>;
};

export default LanguageSwitcher;
