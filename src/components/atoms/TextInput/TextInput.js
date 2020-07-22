import PropTypes from 'prop-types';
import React from 'react';

const TextInput = ({ name, type, label, value, isValid, errorMessage, onChange, onBlur }) => <div>
  <label htmlFor={name}>{label && `${label}:`}
    <input type={type} name={name} value={value} onChange={onChange} onBlur={onBlur} />
  </label>
  {!isValid && <small>{errorMessage}</small>}
</div>;

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
