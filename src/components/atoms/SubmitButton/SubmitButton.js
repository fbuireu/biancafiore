import PropTypes from 'prop-types';
import Error from '../../../assets/svg-components/error.svg';
import Plane from '../../../assets/svg-components/plane.svg';
import './SubmitButton.scss';

const SubmitButton = ({ submitStatus }) => {
  return <>
    <button
      className={`submit-button ${submitStatus.sent ? `--is-sent` : ``}${submitStatus.error ? `--is-error` : ``}${submitStatus.sending ? `--is-sending` : ``}`}>
      <svg className="submit-button__layer">
        <rect width="300" height="60px" />
      </svg>
      <svg className="plane">
        <use xlinkHref="#plane" />
      </svg>
      <ul>
        <li>
          {submitStatus.initial && `Send`}
          {submitStatus.sending && `Sending`}
          {submitStatus.sent && `Sent`}
          {submitStatus.error && `Oops!`}
        </li>
      </ul>
    </button>
    <div className={`submit-button__svg__wrapper`}>
      {submitStatus.error ? <Error className={`plane__ko`} /> : <Plane />}
    </div>
    <small
      className={`submit-button__submit__message ${submitStatus.sent ? `--is-sent` : ``}${submitStatus.error ? `--is-error` : ``}`}>
      {submitStatus.sent && `You can resend the form by refilling it`}
      {submitStatus.error && `Something went wrong. Please check your connection and try again`}
    </small>
  </>;
};

SubmitButton.propTypes = {
  submitStatus: PropTypes.bool.isRequired
};

SubmitButton.defaultProps = {};

export default SubmitButton;

