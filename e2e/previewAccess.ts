export type RequestHeaders = Record<string, string>;

interface WithAccessHeadersParams {
	headers: RequestHeaders;
	access: RequestHeaders;
}

export const previewAccessHeaders = (): RequestHeaders | undefined => {
	const id = process.env.CF_ACCESS_CLIENT_ID;
	const secret = process.env.CF_ACCESS_CLIENT_SECRET;
	if (!id && !secret) return undefined;
	if (!id || !secret) {
		throw new Error(`CF Access misconfigured: ${!id ? "CF_ACCESS_CLIENT_ID" : "CF_ACCESS_CLIENT_SECRET"} is missing`);
	}
	return { "CF-Access-Client-Id": id, "CF-Access-Client-Secret": secret };
};

export const isPreviewRequest =
	(baseURL: string) =>
	(url: URL): boolean =>
		url.origin === new URL(baseURL).origin;

export const withAccessHeaders = ({ headers, access }: WithAccessHeadersParams): RequestHeaders => ({
	...headers,
	...access,
});
