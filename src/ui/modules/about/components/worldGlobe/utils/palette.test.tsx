import { THEME_ATTRIBUTE } from "@modules/core/components/themeToggle/const";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WORLD_GLOBE_CONFIG } from "../const";
import { observeTheme, readColour, readGlobePalette } from "./palette";

const { LAND_TOKEN, MESH_PHONG_MATERIAL_CONFIG } = WORLD_GLOBE_CONFIG;
const { OCEAN_TOKEN } = MESH_PHONG_MATERIAL_CONFIG;

const stubColours = (pixels: Record<string, number[]>) => {
	const probes: string[] = [];
	let filled = "";

	vi.spyOn(window, "getComputedStyle").mockImplementation((element) => {
		const token = (element as HTMLElement).style.color.replace("var(", "").replace(")", "");

		probes.push(token);

		return { color: token } as CSSStyleDeclaration;
	});
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => ({
		set fillStyle(value: string) {
			filled = value;
		},
		fillRect: vi.fn(),
		getImageData: () => ({ data: pixels[filled] }),
	})) as never);

	return probes;
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
	vi.restoreAllMocks();
	document.documentElement.removeAttribute(THEME_ATTRIBUTE);
	document.documentElement.removeAttribute("lang");
});

describe("readColour", () => {
	it("answers the hex a token paints, whatever syntax the browser resolves it to", () => {
		const probes = stubColours({ "--gold-bright": [181, 142, 77, 255] });

		expect(readColour("--gold-bright")).toBe("#b58e4d");
		expect(probes).toEqual(["--gold-bright"]);
	});

	it("leaves no probe behind in the page", () => {
		stubColours({ "--surface": [241, 237, 227, 255] });

		readColour("--surface");

		expect(document.body.querySelector("span")).toBeNull();
	});

	it("answers the colour the browser resolved when it hands out no canvas context to read it back from", () => {
		vi.spyOn(window, "getComputedStyle").mockReturnValue({ color: "rgb(1, 2, 3)" } as CSSStyleDeclaration);
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

		expect(readColour("--surface")).toBe("rgb(1, 2, 3)");
	});
});

describe("readGlobePalette", () => {
	it("reads the land and the sea from the tokens the globe names", () => {
		stubColours({ [LAND_TOKEN]: [221, 192, 132, 255], [OCEAN_TOKEN]: [29, 26, 19, 255] });

		expect(readGlobePalette()).toEqual({ land: "#ddc084", ocean: "#1d1a13" });
	});
});

describe("observeTheme", () => {
	it("calls back when the theme attribute changes, and for no other attribute", async () => {
		const onChange = vi.fn();
		const stop = observeTheme(onChange);

		document.documentElement.setAttribute("lang", "it");
		await settle();
		expect(onChange).not.toHaveBeenCalled();

		document.documentElement.setAttribute(THEME_ATTRIBUTE, "dark");
		await settle();
		expect(onChange).toHaveBeenCalledTimes(1);

		stop();
	});

	it("stops calling back once it is told to", async () => {
		const onChange = vi.fn();
		const stop = observeTheme(onChange);

		stop();
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "dark");
		await settle();

		expect(onChange).not.toHaveBeenCalled();
	});
});
