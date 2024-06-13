import { CONTACT_DETAILS } from "@const/index.ts";

export function mailTo() {
	const selector = document.querySelector(".mailTo__button");
	if (!selector) return;

	selector.addEventListener("click", () => {
		const email = atob(CONTACT_DETAILS.encodedBiancaEmail);
		window.location.href = `mailto:${email}`;
	});
}
