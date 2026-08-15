import { CONTACT_DETAILS } from "@const/index";

export const EMAIL_BUTTON_CLASS = "mail-to__button";
export const EMAIL_BUTTON_ADDRESS_CLASS = `${EMAIL_BUTTON_CLASS}--address`;
export const EMAIL_ADDRESS_PLACEHOLDER = "our email address";

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
