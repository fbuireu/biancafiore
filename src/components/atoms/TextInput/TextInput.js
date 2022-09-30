import PropTypes from 'prop-types'
import './TextInput.scss'
import React from 'react'

const TextInput = ({
  name,
  type,
  label,
  placeholder,
  value,
  isValid,
  errorMessage,
  onChange,
  onBlur,
}) => {
  return <div
    className={`text-input__wrapper ${!isValid ? `--is-invalid` : ``} ${value
      ? `--has-value`
      : ``} ${type === `hidden` ? `--is-hidden` : ``}`}>
    <label className={`text-input__label`} htmlFor={name}>
      <input className={`text-input`}
             type={type}
             name={name}
             value={value}
             spellCheck={true}
             onChange={onChange}
             onBlur={onBlur}
      />
      <p className={`text-input__label__text`}>{label ?? placeholder}</p>
    </label>
    {!isValid && <small className={`text-input__error-message`}>{errorMessage}</small>}
  </div>;
};

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
};

TextInput.defaultProps = {};

export default TextInput;
