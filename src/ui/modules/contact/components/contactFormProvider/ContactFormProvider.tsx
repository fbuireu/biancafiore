import { GOOGLE_RECAPTCHA_SITE_KEY } from "astro:env/client";
import { ContactForm } from "@modules/contact/components/contactForm";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export const ContactFormProvider = () => {
	return (
		<GoogleReCaptchaProvider reCaptchaKey={GOOGLE_RECAPTCHA_SITE_KEY}>
			<ContactForm />
		</GoogleReCaptchaProvider>
	);
};
