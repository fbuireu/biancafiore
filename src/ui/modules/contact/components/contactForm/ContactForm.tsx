import { actions } from "astro:actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { autosize } from "@modules/contact/utils/autosize";
import { flyPlane } from "@modules/contact/utils/flyPlane";
import Spinner from "@modules/core/components/spinner/Spinner";
import type { FormEvent } from "react";
import { useCallback, useRef, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useForm } from "react-hook-form";
import { contactFormSchema } from '@application/entities/contact/schema';
import "./contact-form.css";

export interface FormData {
	name: string;
	email: string;
	message: string;
	recaptcha: string;
}

enum FormStatus {
	INITIAL = "initial",
	LOADING = "loading",
	SUCCESS = "success",
	ERROR = "error",
}

export const ContactForm = () => {
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(contactFormSchema),
	});
	const [formStatus, setFormStatus] = useState<FormStatus>(FormStatus.INITIAL);
	const { executeRecaptcha } = useGoogleReCaptcha();
	const submitRef = useRef<HTMLButtonElement>(null);

	const verifyRecaptcha = useCallback(
		async (data: FormData, event: FormEvent<HTMLFormElement>) => {
			if (!executeRecaptcha) return;
			const token = await executeRecaptcha();

			if (!token) {
				setError("recaptcha", {
					type: "manual",
					message: "Mr.Robot, is that you?",
				});
				return;
			}
			await submitForm(data, event);
		},
		[executeRecaptcha, setError],
	);

	const resetForm = useCallback(() => setFormStatus(FormStatus.INITIAL), []);

	const submitForm = useCallback(
		async (data: FormData, event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (!submitRef.current) return;

			try {
				setFormStatus(FormStatus.LOADING);
				const contactData = new FormData();
				contactData.append("name", data.name);
				contactData.append("email", data.email);
				contactData.append("message", data.message);

				const { data: response, error } = await actions.contact(contactData);

				if (response.ok && !error) {
					flyPlane(submitRef.current);
					setTimeout(() => {
						setFormStatus(FormStatus.SUCCESS);
						reset();
					}, 2000);
				} else {
					throw new Error("Failed to submit form");
				}
			} catch (error) {
				setFormStatus(FormStatus.ERROR);
			}
		},
		[reset],
	);

	return (
		<>
			{formStatus !== FormStatus.SUCCESS ? (
				<form
					className="contact-form"
					onSubmit={(event) => handleSubmit((data) => verifyRecaptcha(data, event))(event)}
				>
					<p className="contact-form__text"> My name is</p>
					<div className="contact-form__input__wrapper --underline-on-hover">
						<input
							id="name"
							type="text"
							placeholder="Your name"
							className="contact-form__input"
							{...register("name")}
						/>
						<label htmlFor="name" className="contact-form__input-label">
							(your name)
						</label>
						{errors.name && <p className="contact-form__input__error-message">{errors.name.message}</p>}
					</div>
					<p className="contact-form__text">and my email is</p>
					<div className="contact-form__input__wrapper --underline-on-hover">
						<input
							id="email"
							type="text"
							placeholder="Your email"
							className="contact-form__input"
							{...register("email")}
						/>
						<label htmlFor="email" className="contact-form__input-label">
							(your email)
						</label>
						{errors.email && <p className="contact-form__input__error-message">{errors.email.message}</p>}
					</div>
					<p className="contact-form__text">
						I look forward to hearing from you within the next 24 hours to discuss further. <br />I have a message for
						you,
					</p>
					<div className="contact-form__textarea__wrapper flex column-wrap justify-flex-start --underline-on-hover">
						<textarea
							id="message"
							placeholder="Why you contact me?"
							className="contact-form__textarea"
							onKeyDown={autosize}
							{...register("message")}
						/>
						<label htmlFor="message" className="contact-form__textarea-label">
							(your message)
						</label>
						{errors.message && <p className="contact-form__textarea__error-message">{errors.message.message}</p>}
					</div>
					<div className="contact-form__recaptcha__wrapper">
						<input type="hidden" {...register("recaptcha")} />
						{errors.recaptcha && <p className="contact-form__recaptcha__error-message">{errors.recaptcha.message}</p>}
					</div>
					{formStatus === FormStatus.ERROR && (
						<div className="contact-form__recaptcha__wrapper">
							<p className="contact-form__recaptcha__error-message">
								Whoopsie! Something went wrong. It's my fault (or actually my boyfriend's). Please try again in a few
								minutes after refreshing the page.
							</p>
						</div>
					)}
					<button
						ref={submitRef}
						className="contact-form__submit plane --is-clickable"
						disabled={formStatus === FormStatus.LOADING}
						type="submit"
					>
						<span>{formStatus !== FormStatus.LOADING ? <>Send email </> : <Spinner />}</span>
						<div className="plane__left-wing" />
						<div className="plane__right-wing" />
						<span />
					</button>
				</form>
			) : (
				<div className="contact-form__success-message flex column-wrap">
					<h4>Form sent correctly! Will be in touch soon</h4>
					<p>Did you forgot something to say?</p>
					<button type="button" className="contact-form__success__reset-button --is-clickable" onClick={resetForm}>
						Make a new inquiry
					</button>
				</div>
			)}
		</>
	);
};
