import "vanilla-cookieconsent/dist/cookieconsent.css";
import { useEffect } from 'react';
import { reset, showPreferences, run } from "vanilla-cookieconsent";
import { Cookie } from '@assets/images/svg-components/cookie';
import { config } from './utils/config.ts';
import './cookie-consent.css'

const CookieConsent = () => {

  useEffect(() => {
    run(config);

    return () => reset()
  }, [])

  return <button type="button" className="cookies_consent_button flex justify-center clickable" onClick={showPreferences}>
    <Cookie classNames={"cookie_consent_icon"} />
  </button>
}

export default CookieConsent