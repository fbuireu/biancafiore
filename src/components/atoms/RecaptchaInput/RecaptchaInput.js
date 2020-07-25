import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import Recaptcha from 'react-google-recaptcha';

const RecaptchaInput = ({ name, isValid, errorMessage, updateField }) => {
  const recaptchaReference = useRef(null);

  const handleChange = async () => {
    let recaptchaValue = recaptchaReference.current.getValue();

    updateField({ value: recaptchaValue, name: `recaptcha` });
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
  updateField: PropTypes.func.isRequired,
};

RecaptchaInput.defaultProps = {};

export default RecaptchaInput;