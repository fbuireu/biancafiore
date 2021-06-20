import { validateField } from './validateField';

export const validateForm = form => {
  let isValidForm = [];
  form.forEach(input => {
    if (input.isRequired) isValidForm.push(validateField(input.name, input));
    else {
      input.isValid = true;
      isValidForm.push(true);
    }
  });

  return !isValidForm.some(item => !item);
};
