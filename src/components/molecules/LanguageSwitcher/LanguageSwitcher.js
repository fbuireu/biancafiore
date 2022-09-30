import { useI18next } from 'gatsby-plugin-react-i18next'
import ArrowDown from '../../../assets/svg-components/arrow-down.svg'
import useBoolean from '../../../utils/hooks/useBoolean'
import { useLanguages } from '../../../utils/hooks/useLanguages'
import './LanguageSwitcher.scss'
import React from 'react'

const LanguageSwitcher = () => {
  const [isLanguageSelectorActive, { toggle }] = useBoolean()

  const languages = useLanguages()
  const { i18n: { language: locale }, changeLanguage } = useI18next()

  const handleLanguage = async (language) => {
    await changeLanguage(language)
  }

  return <li className={`language-switcher__wrapper ${isLanguageSelectorActive
    ? `--is-open`
    : ``}`}>
    <span onClick={toggle} className={`language-switcher__icon`}>
      <ArrowDown className={`arrow-down`}/>
    </span>
    <ul className={`language-switcher__list`}>
      {languages.map(language => isLanguageSelectorActive &&
        <li className={`language-switcher__item ${locale ===
        language.isoCode ? `--is-current-language` : ``}`}
            onClick={() => handleLanguage(language.isoCode)}>
        </li>,
      )}
    </ul>
  </li>;
};

export default LanguageSwitcher;
