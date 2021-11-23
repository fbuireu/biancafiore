import PropTypes from 'prop-types';
import './TextareaInput.scss';

const TextareaInput = ({ name, label, placeholder, value, isValid, errorMessage, onChange, onBlur }) => {
  return <div className={`textarea-input__wrapper ${!isValid ? `--is-invalid` : ``}`}>
    <label className={`textarea-input__label`} htmlFor={name}>
      <textarea className={`textarea-input`}
                name={name}
                value={value}
                spellCheck={true}
                onChange={onChange}
                onBlur={onBlur}
      />
      <p className={`textarea-input__label__text`}>{label ?? placeholder}</p>
    </label>
    {!isValid && <small className={`textarea-input__error-message`}>{errorMessage}</small>}
  </div>;
};

TextareaInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired
};

TextareaInput.defaultProps = {};

export default TextareaInput;