import type { CityPoint } from "@modules/about/utils/globe";
import { act, cleanup, render, screen } from "@testing-library/react";
import { server } from "@tests/doubles/network";
import { HttpResponse, http } from "msw";
import { Suspense } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WORLD_GLOBE_CONFIG } from "./const";

interface GlobeProps {
	ref?: { current: unknown };
	onGlobeReady?: () => void;
	hexPolygonsData?: unknown[];
	hexPolygonColor?: () => string;
	htmlElement?: (data: unknown) => Element;
	width?: number;
	height?: number;
	pointsData?: unknown;
	globeMaterial?: unknown;
	showAtmosphere?: boolean;
	backgroundColor?: string;
}

const globeProps = vi.hoisted(() => [] as GlobeProps[]);
const materials = vi.hoisted(() => [] as Record<string, unknown>[]);
const globeDouble = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("react-globe.gl", () => ({
	default: (props: GlobeProps) => {
		globeProps.push(props);

		if (props.ref) props.ref.current = globeDouble.current;

		return <div data-testid="globe" />;
	},
}));

vi.mock("three", () => ({
	MeshPhongMaterial: class {
		constructor(options: Record<string, unknown>) {
			materials.push(options);
		}
	},
}));

const COUNTRIES_URL = "*/countries.json";

const FEATURES = [{ type: "Feature", properties: { name: "Spain" }, geometry: {} }];

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
	globeDouble.current = makeGlobe();
	server.use(http.get(COUNTRIES_URL, () => HttpResponse.json({ features: FEATURES })));
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("WorldGlobeCanvas", () => {
	it("draws the countries it fetched", async () => {
		await mountCanvas();

		expect(screen.getByTestId("globe")).toBeDefined();
		expect(globeProps.at(-1)?.hexPolygonsData).toStrictEqual(FEATURES);
		expect(globeProps.at(-1)?.hexPolygonColor?.()).toBe(WORLD_GLOBE_CONFIG.HEXAGON_POLYGON_COLOR);
	});

	it("draws a globe rather than a photograph of one, and leaves the page's background showing", async () => {
		await mountCanvas();

		expect(materials.at(-1)).toStrictEqual({
			color: WORLD_GLOBE_CONFIG.MESH_PHONG_MATERIAL_CONFIG.COLOR,
			opacity: WORLD_GLOBE_CONFIG.MESH_PHONG_MATERIAL_CONFIG.OPACITY,
			transparent: WORLD_GLOBE_CONFIG.MESH_PHONG_MATERIAL_CONFIG.TRANSPARENT,
		});
		expect(globeProps.at(-1)?.backgroundColor).toBe(WORLD_GLOBE_CONFIG.BACKGROUND_COLOR);
		expect(globeProps.at(-1)?.showAtmosphere).toBe(false);
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
		server.use(http.get(COUNTRIES_URL, () => HttpResponse.error()));

		await mountCanvas();

		expect(globeProps.at(-1)?.hexPolygonsData).toStrictEqual([]);
		expect(screen.getByTestId("globe")).toBeDefined();
	});
});
