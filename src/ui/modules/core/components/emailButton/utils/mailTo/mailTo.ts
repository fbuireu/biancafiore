import { CONTACT_DETAILS } from "@const/index";

let isListening = false;

export function mailTo(): void {
	if (isListening) {
		return;
	}
	isListening = true;

	document.addEventListener("click", (event) => {
		const button = (event.target as HTMLElement).closest(".mailTo__button");
		if (!button || !event.isTrusted) {
			return;
		}

		event.preventDefault();

		const mailto = encodeURIComponent(`"${CONTACT_DETAILS.NAME}"<${atob(CONTACT_DETAILS.ENCODED_EMAIL_BIANCA)}>`);

		window.location.href = `mailto:${mailto}`;
	});
}
