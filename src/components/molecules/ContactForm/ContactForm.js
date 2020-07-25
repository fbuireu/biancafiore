import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import encode from '../../../utils/form/encode';
import validateField from '../../../utils/form/validateField';
import validateForm from '../../../utils/form/validateForm';
import FormComponentsMapper from '../FormComponentsMapper/FormComponentsMapper';

const ContactForm = ({ formInputs }) => {
  const [formState, setFormState] = useState(formInputs);
  const formReference = useRef(null);

  const handleChange = ({ target }) => {
    const { name, field } = updateField(target);
    if (!field.isValid) validateField(name, field);
  };

  const handleBlur = ({ target }) => {
    const { name, field } = updateField(target);
    validateField(name, field);
    console.log(`handleBlur`,field);
  };

  const updateField = ({ value, name }) => {
    const scopedForm = [...formState];
    const field = scopedForm.find(field => field.name === name);
    field.value = value;
    field.isValid = true;
    setFormState([...scopedForm]);

    console.log(`updateField`,field);
    console.log(`value`,field);
    console.log(`name`,name);

    return { name, field };
  };

  const handleSubmit = event => {
    event.preventDefault();
    const data = {};
    const scopedForm = [...formState];

    let isValidForm = validateForm(scopedForm);
    setFormState([...scopedForm]);

    if (!isValidForm) return false;

    formInputs.forEach(input => data[input.name] = input.value);

    fetch(`/`, {
      method: `POST`,
      headers: {
        'Content-Type': `application/x-www-form-urlencoded`,
      },
      body: encode({
        'form-name': event.target.getAttribute(`name`),
        ...data,
      }),
    })
      .then(() => console.log(`OK`))
      .catch(error => alert(error));
  };

  return <form ref={formReference}
               name={`Contact Form`}
               method={`POST`}
               action={`/`}
               data-netlify={true}
               data-netlify-honeypot={`bot-field`}
               data-netlify-recaptcha={true}
               onSubmit={handleSubmit}>
    {formState.map(input => {
      let FormComponent = FormComponentsMapper[input.type];

      return <FormComponent key={input.name} {...input} onChange={handleChange} onBlur={handleBlur} />;
    })}
    <button type={`submit`}>Send</button>
  </form>;
};

ContactForm.propTypes = {
  formInputs: PropTypes.arrayOf(PropTypes.object).isRequired,
};

ContactForm.defaultProps = {};

export default ContactForm;

