import PropTypes from 'prop-types';
import React from 'react';

const TextInput = ({ name, type, isRequired, label, value, isValid, errorMessage, onChange, onBlur }) => {
  name = name.toLowerCase();

  return <div>
    <label htmlFor={name}>{label}:
      <input type={type} name={name} value={value} required={isRequired} onChange={onChange} onBlur={onBlur} />
    </label>
    {!isValid && <div>{errorMessage}</div>}
  </div>;
}
;

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  isRequired: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
};

TextInput.defaultProps = {};

export default TextInput;
