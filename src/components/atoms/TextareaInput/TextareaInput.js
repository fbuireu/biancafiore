import PropTypes from 'prop-types';
import React from 'react';

const TextareaInput = ({ name, isRequired, label, isValid, errorMessage }) => {
  name = name.toLowerCase();

  return <div>
    <label htmlFor={name}>{label}:
      <textarea name={name} required={isRequired} />
    </label>
    {!isValid && <div>{errorMessage}</div>}
  </div>;
};
TextareaInput.propTypes = {
  name: PropTypes.string.isRequired,
  isRequired: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
};

TextareaInput.defaultProps = {};

export default TextareaInput;