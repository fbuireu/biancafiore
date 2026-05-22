import type { CookieValue } from "vanilla-cookieconsent";
import { acceptedCategory } from "vanilla-cookieconsent";

export function updatePreferences(cookie: CookieValue): void {
	function gtag() {
		// biome-ignore lint/complexity/noArguments: GA integration
		window.dataLayer.push(arguments);
	}

	const category = cookie.categories.at(0) ?? "analytics";

	// @ts-expect-error: gtag uses arguments internally, TS can't infer the call signature
	gtag("consent", "update", {
		analytics_storage: acceptedCategory(category) ? "granted" : "denied",
		wait_for_update: 500,
	});
}
