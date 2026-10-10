import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

export const SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
export const GREEN_CHECK_URL = "https://api.thegreenwebfoundation.org/api/v3/greencheck/*";
const COUNTRIES_URL = "*/countries.json";

const CORS_HEADERS = { "access-control-allow-origin": "*" };

export const escapedRequests: string[] = [];

export const server = setupServer(
	http.all("*", ({ request }) => {
		escapedRequests.push(`${request.method} ${request.url}`);

		return HttpResponse.error();
	}),
);

export interface RecaptchaCall {
	url: string;
	contentType: string | null;
	secret: string | null;
	response: string | null;
}

export interface RecaptchaDoubleParams {
	success?: boolean;
	score?: number;
	errorCodes?: string[];
	unreachable?: boolean;
	malformed?: boolean;
	answer?: unknown;
}

export interface RecaptchaDouble {
	calls: RecaptchaCall[];
}

export function recaptchaDouble({
	success = true,
	score,
	errorCodes,
	unreachable,
	malformed,
	answer,
}: RecaptchaDoubleParams = {}): RecaptchaDouble {
	const calls: RecaptchaCall[] = [];

	server.use(
		http.post(SITEVERIFY_URL, async ({ request }) => {
			const contentType = request.headers.get("content-type");
			const body = new URLSearchParams(await request.text());

			calls.push({ url: request.url, contentType, secret: body.get("secret"), response: body.get("response") });

			if (unreachable) return HttpResponse.error();
			if (malformed) return HttpResponse.text("not json at all");
			if (answer !== undefined) return HttpResponse.json(answer);

			return HttpResponse.json({
				success,
				...(score === undefined ? {} : { score }),
				...(errorCodes === undefined ? {} : { "error-codes": errorCodes }),
			});
		}),
	);

	return { calls };
}

export interface GreenCheckDoubleParams {
	green?: boolean;
	unreachable?: boolean;
	malformed?: boolean;
	answer?: unknown;
}

export interface GreenCheckDouble {
	calls: string[];
}

export function greenCheckDouble({
	green = false,
	unreachable,
	malformed,
	answer,
}: GreenCheckDoubleParams = {}): GreenCheckDouble {
	const calls: string[] = [];

	server.use(
		http.options(GREEN_CHECK_URL, () => new HttpResponse(null, { status: 204, headers: CORS_HEADERS })),
		http.get(GREEN_CHECK_URL, ({ request }) => {
			calls.push(request.url);

			if (unreachable) return HttpResponse.error();
			if (malformed) return HttpResponse.text("not json at all");
			if (answer !== undefined) return HttpResponse.json(answer);

			return HttpResponse.json({ green });
		}),
	);

	return { calls };
}

export interface CountriesDoubleParams {
	unreachable?: boolean;
	malformed?: boolean;
	answer?: unknown;
}

export interface CountriesDouble {
	calls: string[];
}

export function countriesDouble({ unreachable, malformed, answer }: CountriesDoubleParams = {}): CountriesDouble {
	const calls: string[] = [];

	server.use(
		http.get(COUNTRIES_URL, ({ request }) => {
			calls.push(request.url);

			if (unreachable) return HttpResponse.error();
			if (malformed) return HttpResponse.text("<!doctype html>");

			return HttpResponse.json(answer ?? { features: [] });
		}),
	);

	return { calls };
}
