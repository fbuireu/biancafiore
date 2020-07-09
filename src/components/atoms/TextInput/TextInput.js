import PropTypes from 'prop-types';
import React from 'react';

const TextInput = ({ name, type, isRequired, label, isValid, errorMessage }) => <div>
  <label>{label}:
    <input type={type} name={name.toLowerCase()} required={isRequired} />
  </label>
  {!isValid && <div>{errorMessage}</div>}
</div>;

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  isRequired: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
};

TextInput.defaultProps = {};

export default TextInput;

