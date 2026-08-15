import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

export const SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

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

export interface RecaptchaDoubleOptions {
	success?: boolean;
	score?: number;
	errorCodes?: string[];
	unreachable?: boolean;
	malformed?: boolean;
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
}: RecaptchaDoubleOptions = {}): RecaptchaDouble {
	const calls: RecaptchaCall[] = [];

	server.use(
		http.post(SITEVERIFY_URL, async ({ request }) => {
			const contentType = request.headers.get("content-type");
			const body = new URLSearchParams(await request.text());

			calls.push({ url: request.url, contentType, secret: body.get("secret"), response: body.get("response") });

			if (unreachable) return HttpResponse.error();
			if (malformed) return HttpResponse.text("not json at all");

			return HttpResponse.json({
				success,
				...(score === undefined ? {} : { score }),
				...(errorCodes === undefined ? {} : { "error-codes": errorCodes }),
			});
		}),
	);

	return { calls };
}

export interface ImageDoubleOptions {
	url: string;
	bytes?: ArrayBuffer;
	status?: number;
	unreachable?: boolean;
}

export interface ImageDouble {
	calls: string[];
}

export function imageDouble({ url, bytes, status = 200, unreachable }: ImageDoubleOptions): ImageDouble {
	const calls: string[] = [];

	server.use(
		http.get(url, ({ request }) => {
			calls.push(request.url);

			if (unreachable) return HttpResponse.error();
			if (status !== 200) return new HttpResponse(null, { status });

			return HttpResponse.arrayBuffer(bytes ?? new ArrayBuffer(8), { headers: { "content-type": "image/webp" } });
		}),
	);

	return { calls };
}
