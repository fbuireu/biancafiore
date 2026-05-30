import { Resend } from "resend";

export async function getEmails() {
	const { getSecret } = await import("astro:env/server");
	return new Resend(getSecret("RESEND_API_KEY")).emails;
}
