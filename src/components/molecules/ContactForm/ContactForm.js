import React from 'react';
import TextareaInput from '../../atoms/TextareaInput/TextareaInput';
import TextInput from '../../atoms/TextInput/TextInput';

const ContactForm = () => {
  return <form name={`contact`} method={`POST`} data-netlify={true} data-netlify-recaptcha={true}>
    <TextInput />
    <TextareaInput />
    <div data-netlify-recaptcha={true} />
    <button type={`submit`}>Send</button>
  </form>;
};

ContactForm.propTypes = {};

ContactForm.defaultProps = {};

export default ContactForm;

