import axios from 'axios';
import PropTypes from 'prop-types';
import * as qs from 'query-string';
import React, { useRef, useState } from 'react';
import Recaptcha from 'react-google-recaptcha';
import validateField from '../../../utils/form/validateField';
import validateForm from '../../../utils/form/validateForm';
import FormComponentsMapper from '../FormComponentsMapper/FormComponentsMapper';

const ContactForm = ({ formInputs, location }) => {
  const [formState, setFormState] = useState(formInputs);
  const formReference = useRef(null);
  const recaptchaReference = useRef(null);

  const handleChange = ({ target }) => {
    const { name, field } = updateField(target);
    if (!field.isValid) validateField(name, field);
  };

  const handleBlur = ({ target }) => {
    const { name, field } = updateField(target);
    validateField(name, field);
  };

  const updateField = ({ value, name }) => {
    const scopedForm = [...formState];
    const field = scopedForm.find(field => field.name === name);

    field.value = value;
    field.isValid = true;
    setFormState([...scopedForm]);

    return { name, field };
  };

  const handleSubmit = event => {
    event.preventDefault();
    const data = {};
    const recaptchaValue = recaptchaReference.current.getValue();
    const scopedForm = [...formState];

    let isValidForm = validateForm(scopedForm);
    setFormState([...scopedForm]);

    if (!isValidForm || !recaptchaValue) return false;

    formInputs.forEach(input => data[input.name] = input.value);

    const AXIOS_PARAMETERS = {
      url: location.pathname,
      method: `POST`,
      headers: { 'Content-Type': `application/x-www-form-urlencoded` },
      data: qs.stringify(data),
    };

    axios(AXIOS_PARAMETERS)
      .then(response => {
        console.log(`OK`, response);
      })
      .catch(error =>
        console.log(`ERROR`, error),
      );
  };

  return <form ref={formReference}
               action={`/contact/success`}
               method={`POST`}
               name={`contact`}
               data-netlify={true}
               data-netlify-recaptcha={true}
               onSubmit={event => handleSubmit(event)}>
    {formState.map(input => {
      let FormComponent = FormComponentsMapper[input.type];

      return <FormComponent key={input.label} {...input} onChange={handleChange} onBlur={handleBlur} />;
    })}
    <Recaptcha ref={recaptchaReference} sitekey={process.env.GATSBY_SITE_RECAPTCHA_KEY} />
    <button type={`submit`} onSubmit={event => handleSubmit(event)}>Send</button>
  </form>;
};

ContactForm.propTypes = {
  formInputs: PropTypes.arrayOf(PropTypes.object).isRequired,
  location: PropTypes.arrayOf(PropTypes.object).isRequired,
};

ContactForm.defaultProps = {};

export default ContactForm;

