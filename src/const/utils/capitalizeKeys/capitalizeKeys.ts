import type { CapitalizeKeys } from "../../types.ts";

export function capitalizeKeys<T extends Record<string, unknown>>(object: T): CapitalizeKeys<T> {
	const result = {} as CapitalizeKeys<T>;
	for (const key in object) {
		if (Object.hasOwn(object, key)) {
			const capitalizedKey = key.toUpperCase() as Uppercase<keyof T & string>;
			result[capitalizedKey] = object[key as keyof T] as CapitalizeKeys<T>[Uppercase<keyof T & string>];
		}
	}
	return result;
}
