import { autosize } from "@modules/contact/utils/autosize";
import { FormStatus } from "@shared/ui/types.ts";
import type { InputHTMLAttributes } from "react";
import "./textarea.css";
import clsx from "clsx";

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
	hasError: boolean;
	errorMessage?: string;
	formStatus: FormStatus;
	label: string;
}

export const Textarea = ({ id, label, hasError, placeholder, formStatus, errorMessage, ...rest }: TextareaProps) => {
	return (
		<div
			className={clsx("contact-form__textarea__wrapper flex column-wrap justify-flex-start", {
				"--underline-on-hover": formStatus !== FormStatus.UNAUTHORIZED,
			})}
		>
			<textarea
				id={id}
				className="contact-form__textarea"
				disabled={formStatus === FormStatus.UNAUTHORIZED}
				placeholder={placeholder}
				onKeyDown={autosize}
				{...rest}
			/>
			<label htmlFor={id} className="contact-form__textarea-label">
				{label}
			</label>
			{hasError && <p className="contact-form__textarea__error-message">{errorMessage}</p>}
		</div>
	);
};
