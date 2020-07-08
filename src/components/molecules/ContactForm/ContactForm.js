import React, { useRef } from 'react';
import Recaptcha from 'react-google-recaptcha';
import TextareaInput from '../../atoms/TextareaInput/TextareaInput';
import TextInput from '../../atoms/TextInput/TextInput';

const ContactForm = () => {
  const recaptchaReference = useRef(null);

  return <form action={`/contact/success`} name={`contact`} method={`POST`} data-netlify={true} data-netlify-recaptcha={true}>
    <TextInput />
    <TextareaInput />
    {/*<div data-netlify-recaptcha={true} />*/}
    <Recaptcha ref={recaptchaReference} sitekey={process.env.GATSBY_SITE_RECAPTCHA_KEY} />
    <button type={`submit`}>Send</button>
  </form>;
};

ContactForm.propTypes = {};

ContactForm.defaultProps = {};

export default ContactForm;

