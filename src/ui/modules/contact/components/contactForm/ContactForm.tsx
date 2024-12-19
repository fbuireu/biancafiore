import { actions } from "astro:actions";
import { contactFormSchema } from "@application/entities/contact/schema";
import { Exception } from "@domain/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { flyPlane } from "@modules/contact/utils/flyPlane";
import { getErrorMessage } from "@modules/contact/utils/getErrorMessage";
import { Input } from "@modules/core/components/form/input";
import { Recaptcha } from "@modules/core/components/form/recaptcha";
import { Textarea } from "@modules/core/components/form/textarea";
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
		// @ts-ignore:next-line (mismatch between Astro zod and react-hook-form zod)
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
					<Input
						id="name"
						type="text"
						placeholder="Your name"
						formStatus={formStatus}
						hasError={!!errors.name}
						errorMessage={errors.name?.message}
						label="(your name)"
						{...register("name")}
					/>
					<p className="contact-form__text">and my email is</p>
					<Input
						id="email"
						type="text"
						placeholder="Your email"
						formStatus={formStatus}
						hasError={!!errors.email}
						errorMessage={errors.email?.message}
						label="(your email)"
						{...register("email")}
					/>
					<p className="contact-form__text">
						I look forward to hearing from you within the next 24 hours to discuss further. <br />I have a message for
						you,
					</p>
					<Textarea
						id="message"
						placeholder="Why you contact me?"
						className="contact-form__textarea"
						formStatus={formStatus}
						label="(your message)"
						hasError={!!errors.message}
						errorMessage={errors.message?.message}
						{...register("message")}
					/>
					<Recaptcha hasError={!!errors.recaptcha} errorMessage={errors.recaptcha?.message} />
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
						<span className="flex">{!pending ? <>Send email</> : <Spinner aria-label="Sending" />}</span>
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
