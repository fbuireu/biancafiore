import React, { useRef } from 'react';
import Recaptcha from 'react-google-recaptcha';
import TextareaInput from '../../atoms/TextareaInput/TextareaInput';
import TextInput from '../../atoms/TextInput/TextInput';

const ContactForm = () => {
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
    <TextInput />
    <TextareaInput />
    <Recaptcha ref={recaptchaReference} sitekey={process.env.GATSBY_SITE_RECAPTCHA_KEY} onChange={handleChange} />
    <button type={`submit`} onSubmit={handleSubmit}>Send</button>
  </form>;
};

ContactForm.propTypes = {};

ContactForm.defaultProps = {};

export default ContactForm;

