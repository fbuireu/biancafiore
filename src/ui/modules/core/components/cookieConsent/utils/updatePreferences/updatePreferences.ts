import type { CookieValue } from "vanilla-cookieconsent";
import { acceptedCategory } from "vanilla-cookieconsent";

export function updatePreferences(cookie: CookieValue): void {
	function gtag() {
		// biome-ignore lint/style/noArguments: GA integration
		window.dataLayer.push(arguments);
	}

	const category = cookie.categories.at(0) ?? "analytics";

	//@ts-ignore:next-line
	gtag("consent", "update", {
		analytics_storage: acceptedCategory(category) ? "granted" : "denied",
		wait_for_update: 500,
	});
}
