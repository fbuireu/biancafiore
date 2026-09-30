import { actions } from "astro:actions";
import { GOOGLE_RECAPTCHA_SITE_KEY } from "astro:env/client";
import { ContactForm } from "@modules/contact/components/contactForm/ContactForm";
import { toContactSubmission } from "@modules/contact/utils/submission";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

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
