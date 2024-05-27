import { useCallback, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import "./contact-form.css";
import { autosize } from "@components/organisms/contactForm/utils/autosize";
import { flyPlane } from "@components/organisms/contactForm/utils/flyPlane";
import Spinner from "@components/atoms/spinner/Spinner.tsx";
import { actions } from "astro:actions";

const schema = z.object({
	name: z.string().trim().min(1, "Please insert your name"),
	email: z.string().trim().min(1, "Please insert a valid email").email(),
	message: z.string().trim().min(1, "Please insert a valid message"),
});

enum FormStatus {
	INITIAL = "initial",
	LOADING = "loading",
	SUCCESS = "success",
	ERROR = "error",
}

export interface FormData {
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
		[executeRecaptcha],
	);

	const resetForm = useCallback(() => setFormStatus(FormStatus.INITIAL), [formStatus]);

	const submitForm = useCallback(async (data: FormData, event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!submitRef.current) return;

		try {
			setFormStatus(FormStatus.LOADING);
			const contactData = new FormData();
			contactData.append("name", data.name);
			contactData.append("email", data.email);
			contactData.append("message", data.message);

			const response = await actions.contact(contactData);

			if (response.ok) {
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
	}, []);

	return (
		<>
			{formStatus !== FormStatus.SUCCESS ? (
				<form
					className="contact-form"
					onSubmit={(event) => handleSubmit((data) => verifyRecaptcha(data, event))(event)}
				>
					<p className="contact-form__text"> My name is</p>
					<div className="contact-form__input-wrapper">
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
					<div className="contact-form__input-wrapper">
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
					<div className="contact-form__textarea-wrapper flex column-wrap justify-flex-start">
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
					<div className="contact-form__recaptcha-wrapper">
						<input type="hidden" {...register("recaptcha")} />
						{errors.recaptcha && <p className="contact-form__recaptcha__error-message">{errors.recaptcha.message}</p>}
					</div>
					{formStatus === FormStatus.ERROR && (
						<div className="contact-form__recaptcha-wrapper">
							<p className="contact-form__recaptcha__error-message">
								Whoopsie! Something went wrong. It's my fault (or actually my boyfriend's). Please try again in a few
								minutes after refreshing the page.
							</p>
						</div>
					)}
					<button
						ref={submitRef}
						className="contact-form__submit plane clickable"
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
					<button type="button" className="contact-form__success__reset-button clickable" onClick={resetForm}>
						Make a new inquiry
					</button>
				</div>
			)}
		</>
	);
};
