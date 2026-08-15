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

export interface ImagesDoubleOptions {
	urls: string[];
	bytes?: ArrayBuffer;
}

export interface ImagesDouble {
	calls: string[];
	maxInFlight: number;
}

export function imagesDouble({ urls, bytes }: ImagesDoubleOptions): ImagesDouble {
	const double: ImagesDouble = { calls: [], maxInFlight: 0 };
	let inFlight = 0;

	server.use(
		...urls.map((url) =>
			http.get(url, async ({ request }) => {
				double.calls.push(request.url);
				inFlight += 1;
				double.maxInFlight = Math.max(double.maxInFlight, inFlight);

				await new Promise((resolve) => setTimeout(resolve, 5));
				inFlight -= 1;

				return HttpResponse.arrayBuffer(bytes ?? new ArrayBuffer(8), { headers: { "content-type": "image/webp" } });
			}),
		),
	);

	return double;
}

export interface ImageDoubleOptions {
	url: string;
	bytes?: ArrayBuffer;
	status?: number;
	unreachable?: boolean;
	failFirst?: number;
}

export interface ImageDouble {
	calls: string[];
}

export function imageDouble({ url, bytes, status = 200, unreachable, failFirst = 0 }: ImageDoubleOptions): ImageDouble {
	const calls: string[] = [];

	server.use(
		http.get(url, ({ request }) => {
			calls.push(request.url);

			if (calls.length <= failFirst) return HttpResponse.error();
			if (unreachable) return HttpResponse.error();
			if (status !== 200) return new HttpResponse(null, { status });

			return HttpResponse.arrayBuffer(bytes ?? new ArrayBuffer(8), { headers: { "content-type": "image/webp" } });
		}),
	);

	return { calls };
}
