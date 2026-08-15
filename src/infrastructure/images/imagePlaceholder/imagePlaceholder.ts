import { buildContentfulImageUrl } from "@infrastructure/images/imageOptimization";
import { Effect } from "effect";

const PLACEHOLDER_WIDTH = 24;
const PLACEHOLDER_QUALITY = 35;
const PLACEHOLDER_CONCURRENCY = 6;
const PLACEHOLDER_ATTEMPTS = 2;

async function requestPlaceholder(url: string): Promise<string | undefined> {
	const response = await fetch(url).catch(() => undefined);

	if (!response?.ok) return undefined;

	const buffer = await response.arrayBuffer().catch(() => undefined);

	return buffer && `data:image/webp;base64,${Buffer.from(buffer).toString("base64")}`;
}

async function readPlaceholder(source: string): Promise<string | undefined> {
	const url = buildContentfulImageUrl({
		source,
		options: { width: PLACEHOLDER_WIDTH, quality: PLACEHOLDER_QUALITY, format: "webp" },
	});

	for (let attempt = 0; attempt < PLACEHOLDER_ATTEMPTS; attempt++) {
		const placeholder = await requestPlaceholder(url);

		if (placeholder) return placeholder;
	}

	return undefined;
}

export async function getImagePlaceholders(sources: string[]): Promise<Map<string, string>> {
	const wanted = [...new Set(sources)];
	const placeholders = new Map<string, string>();
	let next = 0;

	const drain = async (): Promise<void> => {
		while (next < wanted.length) {
			const source = wanted[next++];

			if (source === undefined) return;

			const placeholder = await readPlaceholder(source);

			if (placeholder) placeholders.set(source, placeholder);
		}
	};

	await Promise.all(Array.from({ length: Math.min(PLACEHOLDER_CONCURRENCY, wanted.length) }, drain));

	const lost = wanted.length - placeholders.size;

	if (lost > 0) {
		await Effect.runPromise(
			Effect.logError(`${lost} of ${wanted.length} image placeholders could not be read; those images ship unblurred`),
		);
	}

	return placeholders;
}
