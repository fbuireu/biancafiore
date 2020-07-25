---
key: contact
formInputs:
  - name: form-name
    type: hidden
    isRequired: false
    label: ''
    value: 'Contact Form'
    isValid: true
    errorMessage: ''
    willBeSubmitted: false
  - name: bot-field
    type: hidden
    isRequired: false
    label: ''
    value: ''
    isValid: true
    errorMessage: ''
    willBeSubmitted: false
  - name: name
    type: text
    isRequired: true
    label: Name
    value: ''
    isValid: true
    errorMessage: Come on, this is just your name
    willBeSubmitted: true
  - name: email
    type: text
    isRequired: true
    label: Email
    value: ''
    isValid: true
    errorMessage: Really, is just your email
    willBeSubmitted: true
  - name: message
    type: textarea
    isRequired: true
    value: ''
    isValid: true
    label: Message
    errorMessage: Imagine my excitement in receiving your message. Now imagine how sad I was when I found out it was empty. You don't want to make me sad, do you?
    willBeSubmitted: true
  - name: recaptcha
    type: recaptcha
    isRequired: true
    label: ''
    value: ''
    isValid: true
    errorMessage: Mr. Robot?
    willBeSubmitted: false
---
Wanna get in touch?