import clsx from "clsx";
import type { InputHTMLAttributes } from "react";
import "./input.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	hasError: boolean;
	errorMessage?: string;
	isLocked?: boolean;
	label?: string;
}

export const Input = ({ id, type, placeholder, label, isLocked, hasError, errorMessage, ...rest }: InputProps) => {
	const errorId = id ? `${id}-error` : undefined;

	return (
		<div
			className={clsx("contact-form__input-wrapper", {
				"underline-on-hover": !isLocked,
			})}
		>
			<input
				id={id}
				type={type}
				placeholder={placeholder}
				className="contact-form__input"
				disabled={isLocked}
				aria-invalid={hasError || undefined}
				aria-describedby={hasError ? errorId : undefined}
				{...rest}
			/>
			{label && id && (
				<label htmlFor={id} className="contact-form__input-label">
					{label}
				</label>
			)}
			{hasError && errorMessage && (
				<p id={errorId} className="contact-form__input__error-message">
					{errorMessage}
				</p>
			)}
		</div>
	);
};
