---
key: contact
jumbotron:
  image: /assets/images/bianca-fiore.jpg
  welcomeText: Say hello!
  welcomeDescription: Hodor hodor hodor hodor hodor hodor hodor hodor hodor hodor
    hodor hodor hodor hodor hodor hodor hodor hodor hodor hodor hodor hodor
    hodor hodor hodor hodor hodor hodor hodor hodor hodor hodor hodor hodor
    hodor hodor hodor hodor hodor hodor hodor hodor hodor hodor hodor hodor
form:
  formInputs:
    - name: form-name
      isValid: true
      type: hidden
      value: Contact Form
    - name: name
      isValid: true
      type: text
      value: ''
      isRequired: true
      label: Name
      errorMessage: Come on, this is just your name
    - name: email
      isValid: true
      type: text
      value: ''
      isRequired: true
      label: Email
      errorMessage: Really, is just your email
    - name: message
      isValid: true
      type: textarea
      value: ''
      isRequired: true
      label: Message
      errorMessage: Imagine my excitement in receiving your message. Now imagine how
        sad I was when I found out it was empty. You don't want to make me sad,
        do you?
    - name: g-recaptcha-response
      isValid: true
      type: recaptcha
      value: ''
      isRequired: true
      errorMessage: Mr. Robot, is that you?
  sectionTitle: Contact me!
  sectionDescription: Explain everything yada yada
---
Wanna get in touch?