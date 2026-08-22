import { CONTACT_DETAILS } from "@const/index";
import { EMAIL_BUTTON_ADDRESS_CLASS, EMAIL_BUTTON_CLASS } from "@modules/core/components/emailButton/const";

const emailAddress = () => atob(CONTACT_DETAILS.ENCODED_EMAIL_BIANCA);

function openComposer(event: Event): void {
	if (!event.isTrusted) {
		return;
	}

	window.location.assign(`mailto:${emailAddress()}`);
}

export function activateEmailButtons(root: ParentNode = document): void {
	for (const button of root.querySelectorAll<HTMLElement>(`.${EMAIL_BUTTON_CLASS}`)) {
		if (button.classList.contains(EMAIL_BUTTON_ADDRESS_CLASS)) {
			button.textContent = emailAddress();
		}

		button.addEventListener("click", openComposer);
	}
}
