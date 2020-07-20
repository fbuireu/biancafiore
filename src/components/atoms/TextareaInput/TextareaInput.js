import PropTypes from 'prop-types';
import React from 'react';

const TextareaInput = ({ name, isRequired, label, value, isValid, errorMessage, onChange, onBlur }) => {
  name = name.toLowerCase();

  return <div>
    <label htmlFor={name}>{label}:
      <textarea name={name} value={value} required={isRequired} onChange={onChange} onBlur={onBlur} />
    </label>
    {!isValid && <div>{errorMessage}</div>}
  </div>;
};
TextareaInput.propTypes = {
  name: PropTypes.string.isRequired,
  isRequired: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
};

TextareaInput.defaultProps = {};

export default TextareaInput;