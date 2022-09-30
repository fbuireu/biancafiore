import PropTypes from 'prop-types'
import Error from '../../../assets/svg-components/error.svg'
import Plane from '../../../assets/svg-components/plane.svg'
import './SubmitButton.scss'
import React from 'react'

const SubmitButton = ({ submitStatus, submitCtaMessages, helperMessages }) => {
  return (
    <>
      <button
        className={`submit-button ${submitStatus.sent ? `--is-sent` : ``}${
          submitStatus.error ? `--is-error` : ``
        }${submitStatus.sending ? `--is-sending` : ``}`}
      >
        <svg className="submit-button__layer">
          <rect width="300" height="60px"/>
        </svg>
        <svg className="plane">
          <use xlinkHref="#plane"/>
        </svg>
        <ul>
          <li>
            {submitStatus.initial &&
              submitCtaMessages.find(
                ({ status }) => status.toLowerCase() === `initial`,
              ).text}
            {submitStatus.sending &&
              submitCtaMessages.find(
                ({ status }) => status.toLowerCase() === `sending`,
              ).text}
            {submitStatus.sent &&
              submitCtaMessages.find(
                ({ status }) => status.toLowerCase() === `sent`,
              ).text}
            {submitStatus.error &&
              submitCtaMessages.find(
                ({ status }) => status.toLowerCase() === `error`,
              ).text}
          </li>
        </ul>
      </button>
      <div className={`submit-button__svg__wrapper`}>
        {submitStatus.error ? <Error className={`plane__ko`}/> : <Plane/>}
      </div>
      <small
        className={`submit-button__submit__message ${
          submitStatus.sent ? `--is-sent` : ``
        }${submitStatus.error ? `--is-error` : ``}`}
      >
        {submitStatus.sent &&
          helperMessages.find(
            ({ status }) => status.toLowerCase() === `sent`).message}
        {submitStatus.error &&
          helperMessages.find(
            ({ status }) => status.toLowerCase() === `error`).message}
      </small>
    </>
  )
};

SubmitButton.propTypes = {
  submitStatus: PropTypes.bool.isRequired,
  submitCtaMessages: PropTypes.bool.isRequired,
  helperMessages: PropTypes.bool.isRequired,
};

SubmitButton.defaultProps = {};

export default SubmitButton;
