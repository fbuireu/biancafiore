import { actions } from "astro:actions";
import { GOOGLE_RECAPTCHA_SITE_KEY } from "astro:env/client";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toContactSubmission } from "../../utils/submission";
import { ContactForm } from "../contactForm/ContactForm";

const submit = (contactData: FormData) => actions.contact(contactData).then(toContactSubmission);

const BoundContactForm = () => {
	const { executeRecaptcha } = useGoogleReCaptcha();

	return <ContactForm submit={submit} getRecaptchaToken={executeRecaptcha} />;
};

export const ContactFormProvider = () => {
	return (
		<GoogleReCaptchaProvider reCaptchaKey={GOOGLE_RECAPTCHA_SITE_KEY}>
			<BoundContactForm />
		</GoogleReCaptchaProvider>
	);
};
