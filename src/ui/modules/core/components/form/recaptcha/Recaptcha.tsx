import type { InputHTMLAttributes } from "react";
import "./recaptcha.css";

interface RecaptchaProps extends InputHTMLAttributes<HTMLInputElement> {
	hasError?: boolean;
	errorMessage?: string;
}

export const Recaptcha = ({ hasError, errorMessage, ...rest }: RecaptchaProps) => {
	return (
		<div className="contact-form__recaptcha__wrapper">
			<input type="hidden" {...rest} />
			{hasError && <p className="contact-form__recaptcha__error-message">{errorMessage}</p>}
		</div>
	);
};
