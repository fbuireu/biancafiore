import { ContactForm } from "@components/modules/contact/components/contactForm";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export const ContactFormProvider = () => {
	return (
		<GoogleReCaptchaProvider reCaptchaKey={import.meta.env.PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY}>
			<ContactForm />
		</GoogleReCaptchaProvider>
	);
};
