export const VALID_NAME = /^[a-z ,.'-]+$/i;
export const VALID_EMAIL =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;

export const validateField = ({ name, field }) => {
  if (!field.value) return (field.isValid = false);

  switch (name) {
    case `name`:
      return (field.isValid = !!field.value.match(VALID_NAME));
    case `email`:
      return (field.isValid = !!field.value.match(VALID_EMAIL));
    case `message`:
    case `comment`:
      return (field.isValid = !!field.value);
    case `g-recaptcha-response`:
      return (field.isValid = !!field.value);
    default:
      field.errorMessage = `Something went wrong`;

      return (field.isValid = false);
  }
};
