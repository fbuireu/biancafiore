import { BOT_REFUSAL_MESSAGE, contactFormSchema } from "@domain/contact/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { flyPlane } from "@modules/contact/utils/form";
import { type ContactSubmission, UNDELIVERED_SUBMISSION } from "@modules/contact/utils/submission";
import { Input } from "@modules/core/components/form/input";
import { Recaptcha } from "@modules/core/components/form/recaptcha";
import { Textarea } from "@modules/core/components/form/textarea";
import Spinner from "@modules/core/components/spinner/Spinner";
import type { ContactFormData } from "@shared/ui/types";
import { FormStatus } from "@shared/ui/types";
import clsx from "clsx";
import { useCallback, useId, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import "./contact-form.css";

interface ContactFormProps {
	submit: (contactData: FormData) => Promise<ContactSubmission>;
	getRecaptchaToken?: () => Promise<string | undefined>;
}

const UNAUTHORIZED_STATUS = 401;
const SUCCESS_DELAY = 2000;

export const ContactForm = ({ submit, getRecaptchaToken }: ContactFormProps) => {
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
		reset,
	} = useForm<ContactFormData>({
		resolver: zodResolver(contactFormSchema.omit({ recaptcha: true })),
	});
	const [pending, startTransition] = useTransition();
	const [formStatus, setFormStatus] = useState<(typeof FormStatus)[keyof typeof FormStatus]>(FormStatus.INITIAL);
	const nameId = useId();
	const emailId = useId();
	const messageId = useId();
	const submitRef = useRef<HTMLButtonElement>(null);

	const submitForm = useCallback(
		async (data: ContactFormData, recaptcha: string) => {
			const button = submitRef.current;
			if (!button) {
				return;
			}

			setFormStatus(FormStatus.LOADING);

			const contactData = new FormData();
			contactData.append("name", data.name);
			contactData.append("email", data.email);
			contactData.append("message", data.message);
			contactData.append("recaptcha", recaptcha);

			const submission = await submit(contactData).catch(() => UNDELIVERED_SUBMISSION);

			if (submission.ok) {
				flyPlane(button);
				setTimeout(() => {
					setFormStatus(FormStatus.SUCCESS);
					reset();
				}, SUCCESS_DELAY);
				return;
			}

			setFormStatus(submission.status === UNAUTHORIZED_STATUS ? FormStatus.UNAUTHORIZED : FormStatus.ERROR);
			setError("root", { type: "manual", message: submission.message });
		},
		[reset, setError, submit],
	);

	const verifyRecaptcha = useCallback(
		async (data: ContactFormData) => {
			if (!getRecaptchaToken) {
				return;
			}

			const token = await getRecaptchaToken().catch(() => undefined);

			if (!token) {
				setError("recaptcha", {
					type: "manual",
					message: BOT_REFUSAL_MESSAGE,
				});
				return;
			}

			await submitForm(data, token);
		},
		[getRecaptchaToken, setError, submitForm],
	);

	return (
		<>
			{formStatus !== FormStatus.SUCCESS ? (
				<form
					className={clsx("contact-form flex row-wrap", {
						"contact-form--disabled": formStatus === FormStatus.UNAUTHORIZED,
					})}
					onSubmit={(event) => {
						event.preventDefault();
						handleSubmit((data) => startTransition(() => verifyRecaptcha(data)))();
					}}
				>
					<p className="contact-form__text"> My name is</p>
					<Input
						id={nameId}
						type="text"
						inputMode="text"
						placeholder="Your name"
						autoComplete="name"
						formStatus={formStatus}
						hasError={!!errors.name}
						errorMessage={errors.name?.message}
						label="(your name)"
						{...register("name")}
					/>
					<p className="contact-form__text">and my email is</p>
					<Input
						id={emailId}
						type="email"
						inputMode="email"
						autoComplete="email"
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
						id={messageId}
						inputMode="text"
						placeholder="Why you contact me?"
						className="contact-form__textarea"
						formStatus={formStatus}
						label="(your message)"
						hasError={!!errors.message}
						errorMessage={errors.message?.message}
						{...register("message")}
					/>
					<Recaptcha hasError={!!errors.recaptcha} errorMessage={errors.recaptcha?.message} />
					<div className="contact-form__generic-error-wrapper">
						{([FormStatus.ERROR, FormStatus.UNAUTHORIZED] as (typeof FormStatus)[keyof typeof FormStatus][]).includes(
							formStatus,
						) && <p className="contact-form__generic-error-message">{errors.root?.message}</p>}
					</div>
					<button
						ref={submitRef}
						className={clsx("contact-form__submit plane clickable", {
							"contact-form__submit--loading": pending || formStatus === FormStatus.LOADING,
						})}
						disabled={formStatus === FormStatus.UNAUTHORIZED}
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
