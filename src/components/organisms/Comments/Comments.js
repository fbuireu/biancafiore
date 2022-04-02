import { useIntl } from 'gatsby-plugin-intl';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { validateField } from '../../../utils/form/validateField';
import { validateForm } from '../../../utils/form/validateForm';
import { localizeDate } from '../../../utils/localizeDate/localizeDate';
import FormComponentsTuple from '../../molecules/FormComponentsTuple/FormComponentsTuple';
import './Comments.scss';

// todo: create form loop +     empty comment message + Show more button CTA
const Comments = ({
  comments,
  commentsContent: { title, subtitle, formInputs, submitCtaMessages, replyCommentCtaMessage, helperMessages },
  commentsLoadingStatus,
  handleComments,
  handleReplies
}) => {
  const { locale } = useIntl();
  const [formState, updateFormState] = useState(formInputs);
  const [submitStatus, setSubmitStatus] = useState({
    initial: true,
    sending: false,
    sent: false,
    error: false
  });

  const handleChange = ({ target }) => {
    const { name, field } = updateField(target);
    if (!field.isValid) validateField({ name, field });
  };

  const handleBlur = ({ target }) => {
    const { name, field } = updateField(target);
    if (field.isRequired) validateField({ name, field });
  };

  const updateField = ({ value, name }) => {
    const scopedForm = [...formState];
    const field = scopedForm.find(({ name: fieldName }) => fieldName === name);

    field.value = value;
    field.isValid = true;
    updateFormState([...scopedForm]);

    return { name, field };
  };

  const handleSubmit = event => {
    event.preventDefault();
    setSubmitStatus({ initial: false, sending: true });

    const comment = {};
    const scopedForm = [...formState];
    let isValidForm = validateForm(scopedForm);
    updateFormState([...scopedForm]);

    if (!isValidForm) {
      setSubmitStatus({ initial: true, sending: false });

      return false;
    }

    formInputs.forEach(({ name, value }) => name !== `g-recaptcha-response` && (comment[name] = value));

    handleComments({ comment });
    setSubmitStatus({ initial: true, sending: false });
  };

  const addReply = ({ replies, uuid }) => {
    handleReplies({
      comment: {
        comment: `Test reply`,
        author: `Test author reply`,
        uuid: uuid,
        replies: [
          ...replies,
          {
            comment: `Test reply`,
            author: `Test author reply`,
            replies: []
          }]
      }
    });
  };

  return <section className={`comments__wrapper wrapper`}>
    <h2 className={`comments__title`}>{title}</h2>
    {subtitle && <h3 className={`comments__subtitle`}>{subtitle}</h3>}
    <form name={`Comment Form`}
          className={`comment__form`}
          method={`POST`}
          action={`/`}
          onSubmit={handleSubmit}>
      {formState.map(input => {
        let { type, name } = input;
        let FormComponent = FormComponentsTuple.get(type);

        return <FormComponent key={name} {...input} onChange={handleChange} onBlur={handleBlur} />;
      })}
      <button>{submitStatus.initial && submitCtaMessages.find(({ status }) => status.toLowerCase() === `initial`).text}</button>
    </form>
    {commentsLoadingStatus.loading && <Skeleton count={5} />}

    {commentsLoadingStatus.loaded && comments.length ?
      comments
        ?.sort((a, b) => new Date(b.createdAt.toDate()) - new Date(a.createdAt.toDate()))
        ?.map(({ uuid, name, comment, createdAt, replies }) => {
          return <div key={uuid} className={`comment__wrapper`}>
            <p className={`comment__name`}>{name}</p>
            <time className={`about-me__latest-articles__date`}
                  dateTime={localizeDate({ date: createdAt.toDate(), locale })}>
              {localizeDate({ date: createdAt.toDate(), locale })}

            </time>
            <p>{comment}</p>
            <button onClick={() => addReply({ replies, uuid })}>
              Reply
            </button>
            Replies:
            {replies?.length && replies
              .sort((a, b) => new Date(b.createdAt.toDate()) - new Date(a.createdAt.toDate()))
              .map(({ uuid, author, comment, createdAt }) => {
                return <div key={uuid}>
                  <p> THIS IS A REPLY:
                    Author: {author}<br />
                    Comment: {comment}<br />
                    uuid: {uuid}<br />
                    Date: {createdAt.toDate().toLocaleDateString()}<br /><br />
                  </p>
                </div>;
              })}
          </div>;
        }) : `Leave a comment.`}
  </section>;
};

Comments.propTypes = {
  comments: PropTypes.objectOf(PropTypes.object).isRequired,
  commentsContent: PropTypes.objectOf(PropTypes.object).isRequired,
  handleComments: PropTypes.objectOf(PropTypes.object).isRequired,
  handleReplies: PropTypes.objectOf(PropTypes.object).isRequired,
  commentsLoadingStatus: PropTypes.objectOf(PropTypes.object).isRequired
};

Comments.defaultProps = {};

export default Comments;
