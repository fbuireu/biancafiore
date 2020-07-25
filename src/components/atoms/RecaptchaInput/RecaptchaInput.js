import PropTypes from 'prop-types';
import React from 'react';
import Recaptcha from 'react-google-recaptcha';

const RecaptchaInput = ({ name, isValid, errorMessage, onChange }) => <div>
  <label htmlFor={name}>
    <Recaptcha sitekey={process.env.GATSBY_SITE_RECAPTCHA_KEY} onChange={onChange} />
  </label>
  {!isValid && <small>{errorMessage}</small>}
</div>;

RecaptchaInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

RecaptchaInput.defaultProps = {};

export default RecaptchaInput;