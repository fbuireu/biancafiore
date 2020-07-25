import React from 'react';
import RecaptchaInput from '../../atoms/RecaptchaInput/RecaptchaInput';
import TextareaInput from '../../atoms/TextareaInput/TextareaInput';
import TextInput from '../../atoms/TextInput/TextInput';

const FormComponentsMapper = {
  text: TextInput,
  email: TextInput,
  hidden: TextInput,
  textarea: TextareaInput,
  recaptcha: RecaptchaInput,
};

export default FormComponentsMapper;





