import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import Recaptcha from 'react-google-recaptcha';

const RecaptchaInput = ({ name, value, isValid, errorMessage, onChange }) => {
  const recaptchaReference = useRef(null);

  useEffect(function resetRecaptcha() {
    let recaptchaId = recaptchaReference.current.getWidgetId();

    if (!value) recaptchaReference.current.reset(recaptchaId);

  }, [value]);

  const handleChange = async () => {
    let recaptchaValue = recaptchaReference.current.getValue();
    let recaptcha = {
      target: {
        value: recaptchaValue,
        name: `g-recaptcha-response`,
      },
    };

    onChange(recaptcha);
  };

  return <div>
    <label htmlFor={name}>
      <Recaptcha sitekey={process.env.GATSBY_SITE_RECAPTCHA_KEY}
                 ref={recaptchaReference}
                 onChange={handleChange} />
    </label>
    {!isValid && <small>{errorMessage}</small>}
  </div>;
};

RecaptchaInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

RecaptchaInput.defaultProps = {};

export default RecaptchaInput;