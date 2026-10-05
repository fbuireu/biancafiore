import { afterEach, describe, expect, it, vi } from "vitest";
import { shuffle } from "./shuffle";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("shuffle", () => {
	it("answers the same members in a new array, and leaves the one it was given alone", () => {
		const entries = ["a", "b", "c", "d"];

		const shuffled = shuffle(entries);

		expect(shuffled).not.toBe(entries);
		expect(entries).toEqual(["a", "b", "c", "d"]);
		expect(shuffled.toSorted()).toEqual(["a", "b", "c", "d"]);
	});

	it("moves each member to a place the random draw picks, from the last place down", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);

		expect(shuffle(["a", "b", "c", "d"])).toEqual(["b", "c", "d", "a"]);
	});

	it("keeps the order when every draw lands on the member's own place", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.999);

		expect(shuffle(["a", "b", "c", "d"])).toEqual(["a", "b", "c", "d"]);
	});

	it("answers nothing for nothing and the member for one member, without drawing", () => {
		const random = vi.spyOn(Math, "random");

		expect(shuffle([])).toEqual([]);
		expect(shuffle(["only"])).toEqual(["only"]);
		expect(random).not.toHaveBeenCalled();
	});
});
