import { test as base, expect } from "@playwright/test";
import { isPreviewRequest, previewAccessHeaders, type RequestHeaders, withAccessHeaders } from "./previewAccess";

const throughPreviewAccess = (access: RequestHeaders) =>
	base.extend({
		context: async ({ context, baseURL }, use) => {
			if (baseURL) {
				await context.route(isPreviewRequest(baseURL), (route) =>
					route.fallback({ headers: withAccessHeaders({ headers: route.request().headers(), access }) }),
				);
			}
			await use(context);
		},
		request: async ({ playwright, baseURL }, use) => {
			const preview = await playwright.request.newContext({ baseURL, extraHTTPHeaders: access });
			await use(preview);
			await preview.dispose();
		},
	});

const PREVIEW_ACCESS = previewAccessHeaders();

export const test = PREVIEW_ACCESS ? throughPreviewAccess(PREVIEW_ACCESS) : base;

export { expect };
