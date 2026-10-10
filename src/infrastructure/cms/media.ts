export const MEDIA_FILE_PATH = "/_emdash/api/media/file/";

const LOCAL_PROVIDER = "local";

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

export const mediaFileUrl = (storageKey: string): string =>
	`${MEDIA_FILE_PATH}${storageKey.split("/").map(encodeURIComponent).join("/")}`;

function localStorageKey(record: Record<string, unknown>): string | undefined {
	const isLocal = (record.provider ?? LOCAL_PROVIDER) === LOCAL_PROVIDER;
	const storageKey = isRecord(record.meta) ? record.meta.storageKey : undefined;

	return isLocal && typeof record.src !== "string" && typeof storageKey === "string" ? storageKey : undefined;
}

function resolve(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(resolve);

	if (!isRecord(value)) return value;

	const resolved = Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolve(entry)]));
	const storageKey = localStorageKey(value);

	return storageKey ? { ...resolved, src: mediaFileUrl(storageKey) } : resolved;
}

export function resolveMedia<VALUE>(value: VALUE): VALUE {
	return resolve(value) as VALUE;
}
