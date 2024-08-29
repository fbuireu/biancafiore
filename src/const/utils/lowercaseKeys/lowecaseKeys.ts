import type { LowercaseKeys } from "../../types";

export function lowercaseKeys<T extends Record<string, unknown>>(object: T): LowercaseKeys<T> {
	const result = {} as LowercaseKeys<T>;
	for (const key in object) {
		if (Object.hasOwn(object, key)) {
			const lowercasedKey = key.toLowerCase() as Lowercase<keyof T & string>;
			result[lowercasedKey] = object[key as keyof T] as LowercaseKeys<T>[Lowercase<keyof T & string>];
		}
	}
	return result;
}
