import type { CookieValue } from "vanilla-cookieconsent";
import { acceptedCategory } from "vanilla-cookieconsent";

export function updatePreferences(cookie: CookieValue) {
	function gtag() {
		// biome-ignore lint/style/noArguments: <explanation>
		window.dataLayer.push(arguments);
	}

	//@ts-ignore
	gtag("consent", "update", {
		analytics_storage: acceptedCategory("analytics") ? "granted" : "denied",
		wait_for_update: 500,
	});
}
