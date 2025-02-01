import { FormStatus } from "@shared/ui/types";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";
import "./input.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	hasError: boolean;
	errorMessage?: string;
	formStatus: FormStatus;
	label?: string;
}

export const Input = ({ id, type, placeholder, label, formStatus, hasError, errorMessage, ...rest }: InputProps) => {
	return (
		<div
			className={clsx("contact-form__input__wrapper", {
				"--underline-on-hover": formStatus !== FormStatus.UNAUTHORIZED,
			})}
		>
			<input
				id={id}
				type={type}
				placeholder={placeholder}
				className="contact-form__input"
				disabled={formStatus === FormStatus.UNAUTHORIZED}
				aria-describedby={hasError ? errorMessage: undefined}
				{...rest}
			/>
			{label && id && (
				<label htmlFor={id} className="contact-form__input-label">
					{label}
				</label>
			)}
			{hasError && errorMessage && <p className="contact-form__input__error-message">{errorMessage}</p>}
		</div>
	);
};
