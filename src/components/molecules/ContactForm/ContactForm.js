import PropTypes from 'prop-types'
import { useState } from 'react'
import { encode } from '../../../utils/form/encode'
import { resetForm } from '../../../utils/form/resetForm'
import { validateField } from '../../../utils/form/validateField'
import { validateForm } from '../../../utils/form/validateForm'
import SubmitButton from '../../atoms/SubmitButton/SubmitButton'

import '../../atoms/SubmitButton/SubmitButton.scss'
import FormComponentsTuple from '../FormComponentsTuple/FormComponentsTuple'
import './ContactForm.scss'

const ContactForm = ({
  form: {
    formTitle, formDescription, formInputs, submitCtaMessages, helperMessages,
  },
}) => {
  const [formState, updateFormState] = useState(formInputs)
  const [submitStatus, setSubmitStatus] = useState({
    initial: true, sending: false, sent: false, error: false,
  })
  const handleChange = ({ target }) => {
    const { name, field } = updateField(target)
    if (!field.isValid) validateField({ name: name, field: field })
  }

  const handleBlur = ({ target }) => {
    const { name, field } = updateField(target)
    validateField({ name: name, field: field })
  }

  const updateField = ({ value, name }) => {
    const scopedForm = [...formState]
    const field = scopedForm.find(({ name: fieldName }) => fieldName === name)

    field.value = value
    field.isValid = true
    updateFormState([...scopedForm])

    return { name, field }
  }

  const handleSubmit = event => {
    event.preventDefault()
    setSubmitStatus({ initial: false, sending: true })

    const data = {}
    const scopedForm = [...formState]
    let isValidForm = validateForm(scopedForm)
    updateFormState([...scopedForm])

    if (!isValidForm) {
      setSubmitStatus({ initial: true, sending: false })

      return false
    }

    formInputs.forEach(input => data[input.name] = input.value)

    const REQUEST_PARAMETERS = {
      method: `POST`,
      headers: { 'Content-Type': `application/x-www-form-urlencoded` },
      body: encode({ ...data }),
    }

    fetch(`/`, REQUEST_PARAMETERS).then(() => {
      setTimeout(() => {
        resetForm(formInputs)
        updateFormState(formInputs)
        setSubmitStatus({ sending: false, sent: true })
      }, 1500)
    }).catch(error => {
      setSubmitStatus({ sending: false, error: true })
      console.log(error)
    })
  }

  return <section className={`wrapper contact-form__wrapper`}>
    <h3 className={`contact-form__header`}>{formTitle}</h3>
    <p className={`contact-form__body`}>{formDescription}</p>
    <form name={`Contact Form`}
          className={`contact-form`}
          method={`POST`}
          action={`/`}
          data-netlify={true}
          data-netlify-honeypot={`bot-field`}
          data-netlify-recaptcha={true}
          onSubmit={handleSubmit}>
      {formState.map(input => {
        let { type, name } = input
        let FormComponent = FormComponentsTuple.get(type)

        return <FormComponent key={name} {...input} onChange={handleChange}
                              onBlur={handleBlur}/>
      })}
      <SubmitButton submitStatus={submitStatus}
                    submitCtaMessages={submitCtaMessages}
                    helperMessages={helperMessages}/>
    </form>
  </section>
}

ContactForm.propTypes = {
  form: PropTypes.arrayOf(PropTypes.object).isRequired,
}

ContactForm.defaultProps = {}

export default ContactForm

