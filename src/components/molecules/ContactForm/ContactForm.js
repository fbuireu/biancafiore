import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import Recaptcha from 'react-google-recaptcha';
import FormComponentsMapper from '../FormComponentsMapper/FormComponentsMapper';

const ContactForm = ({ formInputs }) => {
  const [formState, setFormState] = useState(formInputs);
  const recaptchaReference = useRef(null);
  const IS_VALID_NAME = /^[a-zA-Z]+$/;
  const IS_VALID_EMAIL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const updateField = ({ target }) => {
    let { value, name } = target;
    const scopedForm = [...formState];
    const field = scopedForm.find(field => field.name.toLowerCase() === name);

    field.value = value;
    field.isValid = true;
    setFormState([...scopedForm]);

    switch (name) {
      case`name`:
        return field.isValid = !!field.value.match(IS_VALID_NAME);
      case`email`:
        return field.isValid = !!field.value.match(IS_VALID_EMAIL);
      case`message`:
        return field.isValid = !!field.value.length;
      default:
        return field.isValid = false, field.errorMessage = `Something went wrong`;
    }
  };

  const validateField = ({ target }) => {
    console.log(`a`,target);
  };

  const handleSubmit = () => {
    const recaptchaValue = recaptchaReference.current.getValue();
    console.log(`submit value`, recaptchaValue);
    // props.onSubmit(recaptchaValue);
  };

  return <form action={`/contact/success`} method={`POST`} name={`contact`} data-netlify={true} data-netlify-recaptcha={true}>
    {formState.map(input => {
      let FormComponent = FormComponentsMapper[input.type];

      return <FormComponent key={input.label} {...input} onChange={updateField} onBlur={validateField} />;
    })}
    <Recaptcha ref={recaptchaReference} sitekey={process.env.GATSBY_SITE_RECAPTCHA_KEY} onChange={updateField} />
    <button type={`submit`} onSubmit={handleSubmit}>Send</button>
  </form>;
};

ContactForm.propTypes = {
  formInputs: PropTypes.arrayOf(PropTypes.object).isRequired,
};

ContactForm.defaultProps = {};

export default ContactForm;

