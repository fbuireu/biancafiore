import { autosize } from "@modules/contact/utils/autosize";
import { FormStatus } from "@shared/ui/types";
import clsx from "clsx";
import type { InputHTMLAttributes, JSX } from "react";
import "./textarea.css";

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
	hasError: boolean;
	errorMessage?: string;
	formStatus: (typeof FormStatus)[keyof typeof FormStatus];
	label: string;
}

export const Textarea = ({
	id,
	label,
	hasError,
	placeholder,
	formStatus,
	errorMessage,
	...rest
}: TextareaProps): JSX.Element => {
	const errorId = id ? `${id}-error` : undefined;

	return (
		<div
			className={clsx("contact-form__textarea-wrapper flex column-wrap justify-flex-start", {
				"--underline-on-hover": formStatus !== FormStatus.UNAUTHORIZED,
			})}
		>
			<textarea
				id={id}
				className="contact-form__textarea"
				disabled={formStatus === FormStatus.UNAUTHORIZED}
				placeholder={placeholder}
				onKeyDown={autosize}
				aria-invalid={hasError || undefined}
				aria-describedby={hasError ? errorId : undefined}
				{...rest}
			/>
			<label htmlFor={id} className="contact-form__textarea-label">
				{label}
			</label>
			{hasError && (
				<p id={errorId} className="contact-form__textarea__error-message">
					{errorMessage}
				</p>
			)}
		</div>
	);
};
