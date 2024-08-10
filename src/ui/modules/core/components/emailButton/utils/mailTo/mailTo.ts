import { CONTACT_DETAILS } from "@const/index.ts";

export function mailTo() {
	const SELECTOR = document.querySelector(".mailTo__button");
	if (!SELECTOR) return;

	SELECTOR.addEventListener("click", (event) => {
		console.log("in", event.isTrusted);
		console.log("in", CONTACT_DETAILS.ENCODED_EMAIL_BIANCA);
		event.preventDefault();
		if (!event.isTrusted) return;
		const mailto = encodeURIComponent(`"${CONTACT_DETAILS.NAME}"<${atob(CONTACT_DETAILS.ENCODED_EMAIL_BIANCA)}>`);

		window.location.href = `mailto:${mailto}`;
	});
}
