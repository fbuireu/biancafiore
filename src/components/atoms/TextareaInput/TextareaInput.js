import PropTypes from 'prop-types';
import './TextareaInput.scss';

const TextareaInput = ({ name, label, value, isValid, errorMessage, isRequired, onChange, onBlur }) => {
  return <div className={`textarea-input__wrapper`}>
    <label className={`textarea-input__label`} htmlFor={name}>
      <p className={`textarea-input__label__text`}>{label && `${label}:`}</p>
      <textarea className={`textarea-input`}
                name={name}
                value={value}
                spellCheck={true}
                onChange={onChange}
                onBlur={onBlur}
                required={isRequired}
      />
    </label>
    {!isValid && <small className={`textarea-input__error-message`}>{errorMessage}</small>}
  </div>;
};

TextareaInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  isRequired: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired
};

TextareaInput.defaultProps = {};

export default TextareaInput;