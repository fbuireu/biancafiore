import React, { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import './contact-form.css';
import { autosize } from '@components/organisms/contactForm/utils/autosize';
import { CONTACT_FORM_REQUEST_PARAMETERS } from 'src/consts.ts';
import { encode } from '@components/organisms/contactForm/utils/encode';
import { flyPlane } from '@components/organisms/contactForm/utils/flyPlane';

const schema = z.object({
    name: z.string().trim().min(1, 'Please insert your name'),
    email: z.string().trim().min(1, 'Please insert a valid email').email(),
    message: z.string().trim().min(1, 'Please insert a valid message'),
});

enum FormStatus {
    INITIAL = 'initial',
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error',
}

interface FormData {
    name: string;
    email: string;
    message: string;
    recaptcha: string;
}

export const ContactForm = () => {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });
    const [formStatus, setFormStatus] = useState<FormStatus>(FormStatus.INITIAL);
    const { executeRecaptcha } = useGoogleReCaptcha();
    const submitRef = useRef<HTMLButtonElement>(null);

    const verifyRecaptcha = useCallback(
        async (data: FormData, event: React.FormEvent<HTMLFormElement>) => {
            if (!executeRecaptcha) return;
            const token = await executeRecaptcha();

            if (!token) {
                setError('recaptcha', {
                    type: 'manual',
                    message: 'Mr.Robot, is that you?',
                });
                return;
            }
            await submitForm(data, event);
        },
        [executeRecaptcha]
    );

    const submitForm = useCallback(async (data: FormData, event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setFormStatus(FormStatus.LOADING);
            const requestParams: RequestInit = {
                ...CONTACT_FORM_REQUEST_PARAMETERS,
                body: encode({ ...data }),
            };

            const response = await fetch(`/`, requestParams);

            if (response.ok) {
                flyPlane(submitRef.current!);
                setTimeout(() => {
                    setFormStatus(FormStatus.SUCCESS);
                    reset();
                }, 2000);
            } else {
                throw new Error('Failed to submit form');
            }
        } catch (error) {
            console.error(error);
            setFormStatus(FormStatus.ERROR);
        }
    }, []);

    return (
        <>
            {formStatus !== FormStatus.SUCCESS ? (
                <form
                    className="contact-form"
                    method={`POST`}
                    action={`/`}
                    data-netlify={true}
                    data-netlify-honeypot={`bot-field`}
                    onSubmit={(event) => handleSubmit((data) => verifyRecaptcha(data, event))(event)}
                >
                    <p className="contact-form__text"> My name is</p>
                    <div className="contact-form__input-wrapper">
                        <input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            className="contact-form__input"
                            {...register('name')}
                        />
                        <label htmlFor="name" className="contact-form__input-label">
                            (your name)
                        </label>
                        {errors.name && <p className="contact-form__input__error-message">{errors.name.message}</p>}
                    </div>
                    <p className="contact-form__text">and my email is</p>
                    <div className="contact-form__input-wrapper">
                        <input
                            id="email"
                            type="text"
                            placeholder="Your email"
                            className="contact-form__input"
                            {...register('email')}
                        />
                        <label htmlFor="email" className="contact-form__input-label">
                            (your email)
                        </label>
                        {errors.email && <p className="contact-form__input__error-message">{errors.email.message}</p>}
                    </div>
                    <p className="contact-form__text">
                        I look forward to hearing from you within the next 24 hours to discuss further. <br />I have a
                        message for you,
                    </p>
                    <div className="contact-form__textarea-wrapper flex column-wrap justify-flex-start">
                        <textarea
                            id="message"
                            placeholder="Why you contact me?"
                            className="contact-form__textarea"
                            onKeyDown={autosize}
                            {...register('message')}
                        />
                        <label htmlFor="message" className="contact-form__textarea-label">
                            (your message)
                        </label>
                        {errors.message && (
                            <p className="contact-form__textarea__error-message">{errors.message.message}</p>
                        )}
                    </div>
                    <div className="contact-form__recaptcha-wrapper">
                        <input type="hidden" {...register('recaptcha')} />
                        <input type="hidden" name="bot-field" />
                        {errors.recaptcha && (
                            <p className="contact-form__recaptcha__error-message">{errors.recaptcha.message}</p>
                        )}
                    </div>
                    <button ref={submitRef} className="contact-form__submit plane clickable" type="submit">
                        <span>Send email</span>
                        <div className="plane__left-wing" />
                        <div className="plane__right-wing" />
                        <span></span>
                    </button>
                </form>
            ) : (
                <h4 className="contact-form__success-message">Form sent correctly! Will be in touch soon</h4>
            )}
        </>
    );
};
