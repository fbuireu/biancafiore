import { THEME_ATTRIBUTE } from "@modules/core/components/themeToggle/const";
import { act, cleanup, render, screen } from "@testing-library/react";
import { type CountriesDouble, countriesDouble } from "@tests/doubles/network";
import { Suspense } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CityPoint } from "../../utils/globe";
import { WORLD_GLOBE_CONFIG } from "./const";

interface GlobeProps {
	ref?: { current: unknown };
	onGlobeReady?: () => void;
	hexPolygonsData?: unknown[];
	hexPolygonColor?: () => string;
	htmlElement?: (data: unknown) => Element;
	width?: number;
	height?: number;
	globeMaterial?: unknown;
	showAtmosphere?: boolean;
	backgroundColor?: string;
}

const globeProps = vi.hoisted(() => [] as GlobeProps[]);
const materials = vi.hoisted(() => [] as Record<string, unknown>[]);
const colourSets = vi.hoisted(() => [] as string[]);
const palette = vi.hoisted(() => ({ current: { land: "#c0ffee", ocean: "#0ddba1" } }));
const globeDouble = vi.hoisted(() => ({ current: undefined as unknown }));
const served = vi.hoisted(() => ({ countries: undefined as unknown }));

vi.mock("react-globe.gl", () => ({
	default: (props: GlobeProps) => {
		globeProps.push(props);

		if (props.ref) props.ref.current = globeDouble.current;

		return <div data-testid="globe" />;
	},
}));

vi.mock("three", () => ({
	MeshPhongMaterial: class {
		color = { set: (value: string) => colourSets.push(value) };

		constructor(options: Record<string, unknown>) {
			materials.push(options);
		}
	},
}));

vi.mock("./utils/palette", async (importOriginal) => ({
	...(await importOriginal<typeof import("./utils/palette")>()),
	readGlobePalette: () => ({ ...palette.current }),
}));

const FEATURES = [
	{ type: "Feature", properties: { name: "Spain" }, geometry: { type: "Polygon", coordinates: [[[0, 0]]] } },
];

const POINTS: CityPoint[] = [
	{ lat: 40, lng: 0, label: "North", slug: "north" },
	{ lat: 20, lng: 40, label: "East", slug: "east" },
];

const makeGlobe = () => {
	const controls = { autoRotate: false, enableZoom: true, autoRotateSpeed: 0 };
	const views: { view: Record<string, number>; duration?: number }[] = [];

	return {
		controls: () => controls,
		pointOfView: (view?: Record<string, number>, duration?: number) => {
			if (!view) return { lng: 10, altitude: 2 };

			views.push({ view, duration });

			return view;
		},
		state: { controls, views },
	};
};

const mountCanvas = async () => {
	vi.resetModules();

	const { default: WorldGlobeCanvas } = await import("./WorldGlobeCanvas");

	await act(async () => {
		render(
			<Suspense fallback={<p>loading</p>}>
				<WorldGlobeCanvas points={POINTS} width={680} />
			</Suspense>,
		);
	});
};

const ready = async () =>
	act(async () => {
		globeProps.at(-1)?.onGlobeReady?.();
	});

const press = async (name: string) =>
	act(async () => {
		screen.getByRole("button", { name }).click();
	});

const lastView = (globe: ReturnType<typeof makeGlobe>) => globe.state.views.at(-1);

beforeEach(() => {
	globeProps.length = 0;
	materials.length = 0;
	colourSets.length = 0;
	palette.current = { land: "#c0ffee", ocean: "#0ddba1" };
	globeDouble.current = makeGlobe();
	served.countries = countriesDouble({ answer: { features: FEATURES } });
});

afterEach(() => {
	document.documentElement.removeAttribute(THEME_ATTRIBUTE);
	cleanup();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

const countriesCalls = () => (served.countries as CountriesDouble).calls;

describe("WorldGlobeCanvas", () => {
	it("asks the site for the countries file it serves, once", async () => {
		await mountCanvas();

		expect(countriesCalls()).toEqual([`${window.location.origin}/countries.json`]);
	});

	it("draws the countries it fetched", async () => {
		await mountCanvas();

		expect(screen.getByTestId("globe")).toBeDefined();
		expect(globeProps.at(-1)?.hexPolygonsData).toStrictEqual(FEATURES);
		expect(globeProps.at(-1)?.hexPolygonColor?.()).toBe(palette.current.land);
	});

	it("draws a globe rather than a photograph of one, and leaves the page's background showing", async () => {
		await mountCanvas();

		expect(materials.at(-1)).toStrictEqual({
			color: palette.current.ocean,
			opacity: WORLD_GLOBE_CONFIG.MESH_PHONG_MATERIAL_CONFIG.OPACITY,
			transparent: WORLD_GLOBE_CONFIG.MESH_PHONG_MATERIAL_CONFIG.TRANSPARENT,
		});
		expect(globeProps.at(-1)?.backgroundColor).toBe(WORLD_GLOBE_CONFIG.BACKGROUND_COLOR);
		expect(globeProps.at(-1)?.showAtmosphere).toBe(false);
	});

	it("repaints the land and the sea when the theme changes, since the tokens resolve to other colours then", async () => {
		await mountCanvas();
		palette.current = { land: "#facade", ocean: "#bada55" };

		await act(async () => {
			document.documentElement.setAttribute(THEME_ATTRIBUTE, "dark");
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		expect(globeProps.at(-1)?.hexPolygonColor?.()).toBe("#facade");
		expect(colourSets.at(-1)).toBe("#bada55");
	});

	it("stops watching the theme once the globe is gone", async () => {
		await mountCanvas();
		cleanup();
		const drawn = globeProps.length;

		palette.current = { land: "#facade", ocean: "#bada55" };
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "dark");
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(globeProps).toHaveLength(drawn);
	});

	it("hands the globe no points layer, whose accessors read an altitude, a radius and a colour no CityPoint carries", async () => {
		await mountCanvas();

		expect(Object.keys(globeProps.at(-1) ?? {}).filter((prop) => prop.startsWith("point"))).toEqual([]);
	});

	it("renders a pin per city, labelled with the city's name", async () => {
		await mountCanvas();

		const pin = globeProps.at(-1)?.htmlElement?.(POINTS[0]);

		expect(pin?.querySelector("title")?.textContent).toContain("North");
	});

	it("centres on the cities it was given rather than on a hardcoded place", async () => {
		const globe = globeDouble.current as ReturnType<typeof makeGlobe>;
		await mountCanvas();

		await ready();

		expect(lastView(globe)?.view).toStrictEqual({ lat: 30, lng: 20, altitude: 1.5 });
	});

	it("turns the reader's own zoom off, since the buttons own it", async () => {
		const globe = globeDouble.current as ReturnType<typeof makeGlobe>;
		await mountCanvas();

		await ready();

		expect(globe.state.controls.enableZoom).toBe(false);
		expect(globe.state.controls.autoRotate).toBe(true);
	});

	it("does not spin for a reader who asked for less motion", async () => {
		vi.stubGlobal("matchMedia", () => ({ matches: true }));
		const globe = globeDouble.current as ReturnType<typeof makeGlobe>;
		await mountCanvas();

		await ready();

		expect(globe.state.controls.autoRotate).toBe(false);
	});

	it("does nothing on ready when the globe has not attached itself yet", async () => {
		globeDouble.current = undefined;
		await mountCanvas();

		await expect(ready()).resolves.not.toThrow();
	});

	it("stops spinning while the tab is hidden, and starts again on return", async () => {
		const globe = globeDouble.current as ReturnType<typeof makeGlobe>;
		const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
		await mountCanvas();
		await ready();

		visibility.mockReturnValue("hidden");
		await act(async () => {
			document.dispatchEvent(new Event("visibilitychange"));
		});
		expect(globe.state.controls.autoRotate).toBe(false);

		visibility.mockReturnValue("visible");
		await act(async () => {
			document.dispatchEvent(new Event("visibilitychange"));
		});
		expect(globe.state.controls.autoRotate).toBe(true);
	});

	it("turns the globe east and west by the same amount", async () => {
		const globe = globeDouble.current as ReturnType<typeof makeGlobe>;
		await mountCanvas();

		await press("Move Right");
		expect(lastView(globe)).toStrictEqual({
			view: { lng: 10 + WORLD_GLOBE_CONFIG.MOVEMENT_OFFSET },
			duration: WORLD_GLOBE_CONFIG.ANIMATION_DURATION,
		});

		await press("Move left");
		expect(lastView(globe)?.view).toStrictEqual({ lng: 10 - WORLD_GLOBE_CONFIG.MOVEMENT_OFFSET });
	});

	it("zooms in by lowering the altitude and out by raising it", async () => {
		const globe = globeDouble.current as ReturnType<typeof makeGlobe>;
		await mountCanvas();

		await press("Zoom In");
		expect(lastView(globe)?.view).toStrictEqual({ altitude: 2 - WORLD_GLOBE_CONFIG.ZOOM_OFFSET });

		await press("Zoom Out");
		expect(lastView(globe)?.view).toStrictEqual({ altitude: 2 + WORLD_GLOBE_CONFIG.ZOOM_OFFSET });
	});

	it("ignores a control press before the globe has attached itself", async () => {
		globeDouble.current = undefined;
		await mountCanvas();

		await expect(press("Zoom In")).resolves.not.toThrow();
	});

	it("draws an empty globe rather than failing when the countries cannot be fetched", async () => {
		const unreachable = countriesDouble({ unreachable: true });

		await mountCanvas();

		expect(unreachable.calls).toHaveLength(1);
		expect(globeProps.at(-1)?.hexPolygonsData).toStrictEqual([]);
		expect(screen.getByTestId("globe")).toBeDefined();
	});

	it.each([
		["a body that is not json", { malformed: true }],
		["json that is not an object", { answer: null }],
		["an object carrying no features", { answer: {} }],
		["features that are not a list", { answer: { features: "Spain" } }],
		["a feature carrying no geometry", { answer: { features: [{ type: "Feature", properties: {} }] } }],
		[
			"a feature whose geometry is not a polygon",
			{
				answer: {
					features: [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [0, 0] } }],
				},
			},
		],
	])("draws an empty globe rather than handing the renderer %s", async (_name, params) => {
		const served = countriesDouble(params);

		await mountCanvas();

		expect(served.calls).toHaveLength(1);
		expect(globeProps.at(-1)?.hexPolygonsData).toStrictEqual([]);
	});

	it("draws both polygons and multipolygons, which is what the countries file carries", async () => {
		const features = [
			{ type: "Feature", properties: { name: "Spain" }, geometry: { type: "Polygon", coordinates: [[[0, 0]]] } },
			{ type: "Feature", properties: { name: "Italy" }, geometry: { type: "MultiPolygon", coordinates: [[[[0, 0]]]] } },
		];
		const polygons = countriesDouble({ answer: { type: "FeatureCollection", features } });

		await mountCanvas();

		expect(polygons.calls).toHaveLength(1);
		expect(globeProps.at(-1)?.hexPolygonsData).toStrictEqual(features);
	});
});
