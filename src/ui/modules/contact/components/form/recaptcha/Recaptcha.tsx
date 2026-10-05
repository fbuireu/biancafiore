import "./recaptcha.css";

interface RecaptchaProps {
	hasError?: boolean;
	errorMessage?: string;
}

export const Recaptcha = ({ hasError, errorMessage }: RecaptchaProps) => {
	return (
		<div className="contact-form__recaptcha-wrapper">
			{hasError && <p className="contact-form__recaptcha__error-message">{errorMessage}</p>}
		</div>
	);
};
