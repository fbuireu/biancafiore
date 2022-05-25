import { changeLocale, FormattedMessage, useIntl } from 'gatsby-plugin-intl';
import moment from 'moment/moment';
import ArrowDown from '../../../assets/svg-components/arrow-down.svg';
import useBoolean from '../../../utils/hooks/useBoolean';
import { useLanguages } from '../../../utils/hooks/useLanguages';
import './LanguageSwitcher.scss';

const LanguageSwitcher = () => {
  const [isLanguageSelectorActive, { toggle }] = useBoolean();

  const languages = useLanguages();
  const { locale: currentLanguage } = useIntl();

  const handleLanguage = language => {
    changeLocale(language);
    moment.locale(language);
  };

  return <li className={`language-switcher__wrapper ${isLanguageSelectorActive ? `--is-open` : ``}`}>
    <span onClick={toggle} className={`language-switcher__icon`}>
      <FormattedMessage id={`global.changeLanguage`} />
      <ArrowDown className={`arrow-down`} />
    </span>
    <ul className={`language-switcher__list`}>
      {languages.map(language => isLanguageSelectorActive &&
        <li className={`language-switcher__item ${currentLanguage === language.isoCode ? `--is-current-language` : ``}`}
            onClick={() => handleLanguage(language.isoCode)}>
          <FormattedMessage id={`global.${language.isoCode}`} />
        </li>
      )}
    </ul>
  </li>;
};

export default LanguageSwitcher;
