import { describe, expect, it } from "vitest";
import { playerEmbed } from "./embeds";

describe("playerEmbed", () => {
	it("turns a YouTube watch, short or share link into its player, the iframe EmDash's editor writes for one", () => {
		for (const link of [
			"https://www.youtube.com/watch?v=abcdefghijk",
			"https://youtu.be/abcdefghijk",
			"https://www.youtube.com/shorts/abcdefghijk",
		]) {
			expect(playerEmbed(link)).toMatchObject({
				src: "https://www.youtube.com/embed/abcdefghijk",
				allowFullscreen: true,
			});
		}
	});

	it("turns a Vimeo link into its player", () => {
		expect(playerEmbed("https://vimeo.com/12345")).toMatchObject({ src: "https://player.vimeo.com/video/12345" });
	});

	it("knows no player for any other address, or for something that is not one", () => {
		expect(playerEmbed("https://example.com/watch?v=abcdefghijk")).toBeUndefined();
		expect(playerEmbed("not a url")).toBeUndefined();
	});
});
