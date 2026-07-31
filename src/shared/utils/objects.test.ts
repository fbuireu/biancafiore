import { groupBy } from "@shared/utils/objects";
import { describe, expect, it } from "vitest";

interface Tag {
	name: string;
	category: string;
}

const tag = ({ name, category }: Tag): Tag => ({ name, category });

describe("groupBy", () => {
	it("collects items under the key the callback returns", () => {
		const design = tag({ name: "layout", category: "design" });
		const code = tag({ name: "effect", category: "code" });

		expect(groupBy({ array: [design, code], keyFn: (item) => item.category })).toEqual({
			code: [code],
			design: [design],
		});
	});

	it("returns the keys in ascending locale order rather than insertion order", () => {
		const array = [
			tag({ name: "one", category: "zebra" }),
			tag({ name: "two", category: "apple" }),
			tag({ name: "three", category: "mango" }),
		];

		expect(Object.keys(groupBy({ array, keyFn: (item) => item.category }))).toEqual(["apple", "mango", "zebra"]);
	});

	it("orders keys case-insensitively, so lowercase precedes the uppercase of the same letter", () => {
		const array = [
			tag({ name: "one", category: "B" }),
			tag({ name: "two", category: "a" }),
			tag({ name: "three", category: "b" }),
		];

		expect(Object.keys(groupBy({ array, keyFn: (item) => item.category }))).toEqual(["a", "b", "B"]);
	});

	it("sorts the items inside each group by their name", () => {
		const array = [
			tag({ name: "zeta", category: "greek" }),
			tag({ name: "alpha", category: "greek" }),
			tag({ name: "beta", category: "greek" }),
		];

		const grouped = groupBy({ array, keyFn: (item) => item.category });

		expect(grouped.greek.map(({ name }) => name)).toEqual(["alpha", "beta", "zeta"]);
	});

	it("sorts names case-insensitively and with diacritics folded to their base letter", () => {
		const array = [
			tag({ name: "Zoe", category: "people" }),
			tag({ name: "ana", category: "people" }),
			tag({ name: "Émile", category: "people" }),
			tag({ name: "bob", category: "people" }),
		];

		const grouped = groupBy({ array, keyFn: (item) => item.category });

		expect(grouped.people.map(({ name }) => name)).toEqual(["ana", "bob", "Émile", "Zoe"]);
	});

	it("returns an empty plain object for an empty array", () => {
		const grouped = groupBy<Tag, string>({ array: [], keyFn: (item) => item.category });

		expect(grouped).toEqual({});
		expect(Object.keys(grouped)).toHaveLength(0);
		expect(Object.getPrototypeOf(grouped)).toBe(Object.prototype);
	});

	it("keeps every item, so the groups partition the input", () => {
		const array = [
			tag({ name: "a", category: "x" }),
			tag({ name: "b", category: "y" }),
			tag({ name: "c", category: "x" }),
		];

		const grouped = groupBy({ array, keyFn: (item) => item.category });

		expect(Object.values(grouped).flat()).toHaveLength(array.length);
	});

	it("does not reorder the array it was given", () => {
		const array = [tag({ name: "zeta", category: "greek" }), tag({ name: "alpha", category: "greek" })];

		groupBy({ array, keyFn: (item) => item.category });

		expect(array.map(({ name }) => name)).toEqual(["zeta", "alpha"]);
	});

	it("stringifies a non-string key, grouping every item under 'undefined'", () => {
		const array = [{ name: "orphan", category: undefined }];

		expect(Object.keys(groupBy({ array, keyFn: (item) => String(item.category) }))).toEqual(["undefined"]);
	});

	it("rejects nameless items at compile time instead of guarding against them at runtime", () => {
		const nameless = { category: "pair" };
		const named = { ...nameless, name: "pair" };

		// @ts-expect-error
		const rejected = () => groupBy({ array: [nameless, nameless], keyFn: ({ category }) => category });
		const accepted = () => groupBy({ array: [named, named], keyFn: ({ category }) => category });

		expect(rejected).toThrow(TypeError);
		expect(accepted()).toEqual({ pair: [named, named] });
	});
});
