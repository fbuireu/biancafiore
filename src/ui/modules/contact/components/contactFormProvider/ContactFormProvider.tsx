import { actions } from "astro:actions";
import { GOOGLE_RECAPTCHA_SITE_KEY } from "astro:env/client";
import { ContactForm } from "@modules/contact/components/contactForm/ContactForm";
import { toContactSubmission } from "@modules/contact/utils/submission";
import { useCallback, useMemo } from "react";

const CONTACT_ACTION_PATH = "/_actions/contact";

import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

const BoundContactForm = () => {
	const { executeRecaptcha } = useGoogleReCaptcha();

	const getRecaptchaToken = useMemo(
		() => (executeRecaptcha ? async () => executeRecaptcha() : undefined),
		[executeRecaptcha],
	);
	const submit = useCallback((contactData: FormData) => actions.contact(contactData).then(toContactSubmission), []);

	return <ContactForm submit={submit} getRecaptchaToken={getRecaptchaToken} action={CONTACT_ACTION_PATH} />;
};

export const ContactFormProvider = () => {
	return (
		<GoogleReCaptchaProvider reCaptchaKey={GOOGLE_RECAPTCHA_SITE_KEY}>
			<BoundContactForm />
		</GoogleReCaptchaProvider>
	);
};
