import { CONTACT_DETAILS } from "@const/index.ts";

export function mailTo() {
	const SELECTOR = document.querySelector(".mailTo__button");
	if (!SELECTOR) return;

	SELECTOR.addEventListener("click", (event) => {
		event.preventDefault();
		if (!event.isTrusted) return;
		const mailto = encodeURIComponent(`"${CONTACT_DETAILS.NAME}"<${atob(CONTACT_DETAILS.ENCODED_EMAIL_BIANCA)}>`);

		window.location.href = `mailto:${mailto}`;
	});
}
