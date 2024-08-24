import type { CookieValue } from "vanilla-cookieconsent";
import { acceptedCategory } from "vanilla-cookieconsent";

export function updatePreferences(cookie: CookieValue) {
	function gtag() {
		// biome-ignore lint/style/noArguments: <explanation>
		window.dataLayer.push(arguments);
	}

	const category = cookie.categories[0] ?? "analytics";

	//@ts-ignore
	gtag("consent", "update", {
		analytics_storage: acceptedCategory(category) ? "granted" : "denied",
		wait_for_update: 500,
	});
}
