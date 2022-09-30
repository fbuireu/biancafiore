import RecaptchaInput from '../../atoms/RecaptchaInput/RecaptchaInput'
import TextareaInput from '../../atoms/TextareaInput/TextareaInput'
import TextInput from '../../atoms/TextInput/TextInput'

const FormComponentsTuple = new Map([
  [`text`, TextInput],
  [`hidden`, TextInput],
  [`email`, TextInput],
  [`textarea`, TextareaInput],
  [`recaptcha`, RecaptchaInput],
])

export default FormComponentsTuple
