import PropTypes from 'prop-types';
import React from 'react';

const TextareaInput = ({ name, label, value, isValid, errorMessage, onChange, onBlur }) => <div>
  <label htmlFor={name}>{label}:
    <textarea name={name} value={value} onChange={onChange} onBlur={onBlur} />
  </label>
  {!isValid && <small>{errorMessage}</small>}
</div>;

TextareaInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
};

TextareaInput.defaultProps = {};

export default TextareaInput;