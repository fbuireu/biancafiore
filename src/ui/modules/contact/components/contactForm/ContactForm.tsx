import { actions } from "astro:actions";
import { contactFormSchema } from "@application/entities/contact/schema";
import { Exception } from "@domain/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { autosize } from "@modules/contact/utils/autosize";
import { flyPlane } from "@modules/contact/utils/flyPlane";
import { getErrorMessage } from "@modules/contact/utils/getErrorMessage";
import Spinner from "@modules/core/components/spinner/Spinner";
import { type ContactFormData, FormStatus } from "@shared/ui/types";
import clsx from "clsx";
import { type FormEvent, useCallback, useRef, useState, useTransition } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useForm } from "react-hook-form";
import "./contact-form.css";

export const ContactForm = () => {
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
		reset,
	} = useForm<ContactFormData>({
		resolver: zodResolver(contactFormSchema),
	});
	const [pending, startTransition] = useTransition();
	const [formStatus, setFormStatus] = useState<FormStatus>(FormStatus.INITIAL);
	const { executeRecaptcha } = useGoogleReCaptcha();
	const submitRef = useRef<HTMLButtonElement>(null);

	const verifyRecaptcha = useCallback(
		async (data: ContactFormData, event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (!executeRecaptcha) return;
			const token = await executeRecaptcha();

			if (!token) {
				setError("recaptcha", {
					type: "manual",
					message: "Mr. Robot, is that you?",
				});
				return;
			}
			await submitForm(data);
		},
		[executeRecaptcha, setError],
	);

	const submitForm = useCallback(
		async (data: ContactFormData) => {
			if (!submitRef.current) return;

			try {
				setFormStatus(FormStatus.LOADING);

				const contactData = new FormData();
				contactData.append("name", data.name);
				contactData.append("email", data.email);
				contactData.append("message", data.message);

				const { data: response, error } = await actions.contact(contactData);

				if (response?.ok) {
					flyPlane(submitRef.current);
					setTimeout(() => {
						setFormStatus(FormStatus.SUCCESS);
						reset();
					}, 2000);
				} else if (error) {
					if (error.status === 401) {
						setFormStatus(FormStatus.UNAUTHORIZED);
						throw new Exception(error);
					}

					setFormStatus(FormStatus.ERROR);
					throw new Error(error.message);
				}
			} catch (error) {
				const errorMessage = getErrorMessage(error);

				setError("root", {
					type: "manual",
					message: errorMessage as string,
				});
			}
		},
		[reset, setError],
	);

	return (
		<>
			{formStatus !== FormStatus.SUCCESS ? (
				<form
					className={clsx("contact-form", {
						"--is-disabled": formStatus === FormStatus.UNAUTHORIZED,
					})}
					onSubmit={(event) => handleSubmit((data) => startTransition(() => verifyRecaptcha(data, event)))()}
				>
					<p className="contact-form__text"> My name is</p>
					<div
						className={clsx("contact-form__input__wrapper", {
							"--underline-on-hover": formStatus !== FormStatus.UNAUTHORIZED,
						})}
					>
						<input
							id="name"
							type="text"
							placeholder="Your name"
							className="contact-form__input"
							disabled={formStatus === FormStatus.UNAUTHORIZED}
							{...register("name")}
						/>
						<label htmlFor="name" className="contact-form__input-label">
							(your name)
						</label>
						{errors.name && <p className="contact-form__input__error-message">{errors.name.message}</p>}
					</div>
					<p className="contact-form__text">and my email is</p>
					<div
						className={clsx("contact-form__input__wrapper", {
							"--underline-on-hover": formStatus !== FormStatus.UNAUTHORIZED,
						})}
					>
						<input
							id="email"
							type="text"
							placeholder="Your email"
							className="contact-form__input"
							disabled={formStatus === FormStatus.UNAUTHORIZED}
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
					<div
						className={clsx("contact-form__textarea__wrapper flex column-wrap justify-flex-start", {
							"--underline-on-hover": formStatus !== FormStatus.UNAUTHORIZED,
						})}
					>
						<textarea
							id="message"
							placeholder="Why you contact me?"
							className="contact-form__textarea"
							onKeyDown={autosize}
							disabled={formStatus === FormStatus.UNAUTHORIZED}
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
					{[FormStatus.ERROR, FormStatus.UNAUTHORIZED].includes(formStatus) && (
						<div className="contact-form__recaptcha__wrapper">
							<p className="contact-form__recaptcha__error-message">{errors.root?.message}</p>
						</div>
					)}
					<button
						ref={submitRef}
						className={clsx("contact-form__submit plane --is-clickable", {
							"--is-loading": pending || formStatus === FormStatus.LOADING,
						})}
						disabled={[FormStatus.UNAUTHORIZED].includes(formStatus)}
						type="submit"
					>
						<span className="flex">{!pending ? <>Send email</> : <Spinner />}</span>
						<div className="plane__left-wing" />
						<div className="plane__right-wing" />
						<span />
					</button>
				</form>
			) : (
				<div className="contact-form__success-message flex column-wrap">
					<h4>Form sent correctly! Will be in touch soon</h4>
				</div>
			)}
		</>
	);
};
