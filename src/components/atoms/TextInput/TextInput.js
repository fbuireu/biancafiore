import PropTypes from 'prop-types';
import React from 'react';
import './TextInput.scss';

const TextInput = ({ name, type, label, value, isValid, errorMessage, onChange, onBlur }) => {
  console.log(`aa`,label);
  return <div className={`text-input__wrapper ${type === `hidden` ? `--is-hidden` : ``}`}>
    <label className={`text-input__label`} htmlFor={name}>
      <p className={`text-input__label__text`}>{label && `${label}:`}</p>
      <input className={`text-input`} type={type} name={name} value={value} onChange={onChange} onBlur={onBlur} />
    </label>
    {!isValid && <small className={`text-input__error-message`}>{errorMessage}</small>}
  </div>;
};

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
};

TextInput.defaultProps = {};

export default TextInput;
