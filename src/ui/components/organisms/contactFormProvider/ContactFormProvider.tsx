import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { ContactForm } from "@components/organisms/contactForm";

export const ContactFormProvider = () => {
	return (
		<GoogleReCaptchaProvider reCaptchaKey={import.meta.env.PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY}>
			<ContactForm />
		</GoogleReCaptchaProvider>
	);
};
