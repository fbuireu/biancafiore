import { Resend } from "resend";
import { getSecret } from "astro:env/server";

export function getEmails() {
	return new Resend(getSecret("RESEND_API_KEY")).emails;
}
