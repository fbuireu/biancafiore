import { CmsError } from "@infrastructure/errors";
import * as contentful from "contentful";
import { Context, Effect, Layer } from "effect";

type ContentfulClient = ReturnType<typeof contentful.createClient>;
type GetEntriesQuery = Parameters<ContentfulClient["getEntries"]>[0];
type EntriesResult = Awaited<ReturnType<ContentfulClient["getEntries"]>>;

export class CmsClient extends Context.Tag("CmsClient")<
	CmsClient,
	{
		getEntries(query: GetEntriesQuery): Effect.Effect<EntriesResult, CmsError>;
	}
>() {}

export function isContentfulConfigured(): boolean {
	return Boolean(process.env.CONTENTFUL_SPACE_ID);
}

export const CmsClientLive = Layer.effect(
	CmsClient,
	Effect.gen(function* () {
		const { getSecret } = yield* Effect.promise(() => import("astro:env/server"));

		const client = contentful.createClient({
			space: getSecret("CONTENTFUL_SPACE_ID") as string,
			accessToken: import.meta.env.DEV
				? (getSecret("CONTENTFUL_PREVIEW_TOKEN") as string)
				: (getSecret("CONTENTFUL_DELIVERY_TOKEN") as string),
			host: import.meta.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
		});

		return {
			getEntries: (query) =>
				Effect.tryPromise({
					try: () => client.getEntries(query),
					catch: (cause) =>
						new CmsError({
							message: cause instanceof Error ? cause.message : String(cause),
							cause,
						}),
				}),
		};
	}),
);
