const IS_VALID_NAME = /^[a-z ,.'-]+$/i;
const IS_VALID_EMAIL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;

const validateField = (name, field) => {
  switch (name) {
    case`name`:
      return field.isValid = !!field.value.match(IS_VALID_NAME);
    case`email`:
      return field.isValid = !!field.value.match(IS_VALID_EMAIL);
    case`message`:
      return field.isValid = !!field.value;
    case`g-recaptcha-response`:
      return field.isValid = !!field.value;
    default:
      field.errorMessage = `Something went wrong`;

      return field.isValid = false;
  }
};

export default validateField;