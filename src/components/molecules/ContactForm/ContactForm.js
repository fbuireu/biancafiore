import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import Recaptcha from 'react-google-recaptcha';
import FormComponentsMapper from '../FormComponentsMapper/FormComponentsMapper';

const ContactForm = ({ formInputs }) => {
  const recaptchaReference = useRef(null);

  const handleChange = value => {
    console.log(value);
  };

  const handleSubmit = () => {
    const recaptchaValue = recaptchaReference.current.getValue();
    console.log(`submit value`, recaptchaValue);
    // props.onSubmit(recaptchaValue);
  };

  return <form action={`/contact/success`} method={`POST`} name={`contact`} data-netlify={true} data-netlify-recaptcha={true}>
    {formInputs.map(input => {
      let FormComponent = FormComponentsMapper[input.type];

      return <FormComponent key={input.label} {...input} />;
    })}
    <Recaptcha ref={recaptchaReference} sitekey={process.env.GATSBY_SITE_RECAPTCHA_KEY} onChange={handleChange} />
    <button type={`submit`} onSubmit={handleSubmit}>Send</button>
  </form>;
};

ContactForm.propTypes = {
  formInputs: PropTypes.arrayOf(PropTypes.object).isRequired,
};

ContactForm.defaultProps = {};

export default ContactForm;

