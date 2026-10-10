import { afterEach, describe, expect, it, vi } from "vitest";
import { isPreviewRequest, previewAccessHeaders, withAccessHeaders } from "./previewAccess";

const PREVIEW = "https://pr-7-site-development.example.workers.dev";

describe("the preview's access headers", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("are none when neither variable is set, so a run against a local server sends no credential", () => {
		vi.stubEnv("CF_ACCESS_CLIENT_ID", undefined);
		vi.stubEnv("CF_ACCESS_CLIENT_SECRET", undefined);

		expect(previewAccessHeaders()).toBeUndefined();
	});

	it("carry the service token when both variables are set", () => {
		vi.stubEnv("CF_ACCESS_CLIENT_ID", "token-id.access");
		vi.stubEnv("CF_ACCESS_CLIENT_SECRET", "token-secret");

		expect(previewAccessHeaders()).toEqual({
			"CF-Access-Client-Id": "token-id.access",
			"CF-Access-Client-Secret": "token-secret",
		});
	});

	it("refuse a half-configured pair and name what is missing, because the preview answers that run with its login page", () => {
		vi.stubEnv("CF_ACCESS_CLIENT_ID", "token-id.access");
		vi.stubEnv("CF_ACCESS_CLIENT_SECRET", undefined);

		expect(() => previewAccessHeaders()).toThrow("CF Access misconfigured: CF_ACCESS_CLIENT_SECRET is missing");

		vi.stubEnv("CF_ACCESS_CLIENT_ID", undefined);
		vi.stubEnv("CF_ACCESS_CLIENT_SECRET", "token-secret");

		expect(() => previewAccessHeaders()).toThrow("CF Access misconfigured: CF_ACCESS_CLIENT_ID is missing");
	});

	it("go to a request on the preview's own origin and to no other, because the token is a credential", () => {
		const isPreview = isPreviewRequest(`${PREVIEW}/`);
		const preview = [`${PREVIEW}/`, `${PREVIEW}/robots.txt`, `${PREVIEW}/api/health?probe=1#top`];
		const elsewhere = [
			"https://www.googletagmanager.com/gtag/js?id=G-TEST",
			"https://js.stripe.com/v3/",
			"https://example.workers.dev/",
			"http://pr-7-site-development.example.workers.dev/",
			"https://pr-7-site-development.example.workers.dev:8443/",
			"https://pr-7-site-development.example.workers.dev.attacker.test/",
		];

		expect(preview.filter((url) => !isPreview(new URL(url)))).toEqual([]);
		expect(elsewhere.filter((url) => isPreview(new URL(url)))).toEqual([]);
	});

	it("join the headers a request already carries rather than replace them", () => {
		expect(
			withAccessHeaders({
				headers: { accept: "text/html", "accept-language": "en" },
				access: { "CF-Access-Client-Id": "token-id.access", "CF-Access-Client-Secret": "token-secret" },
			}),
		).toEqual({
			accept: "text/html",
			"accept-language": "en",
			"CF-Access-Client-Id": "token-id.access",
			"CF-Access-Client-Secret": "token-secret",
		});
	});
});
