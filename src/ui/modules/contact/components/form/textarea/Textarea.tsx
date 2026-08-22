import clsx from "clsx";
import type { InputHTMLAttributes, JSX } from "react";
import "./textarea.css";

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
	hasError: boolean;
	errorMessage?: string;
	isLocked?: boolean;
	label: string;
}

export const Textarea = ({
	id,
	label,
	hasError,
	placeholder,
	isLocked,
	errorMessage,
	...rest
}: TextareaProps): JSX.Element => {
	const errorId = id ? `${id}-error` : undefined;

	return (
		<div
			className={clsx("contact-form__textarea-wrapper flex column-wrap justify-flex-start", {
				"underline-on-hover": !isLocked,
			})}
		>
			<textarea
				id={id}
				className="contact-form__textarea"
				disabled={isLocked}
				placeholder={placeholder}
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
