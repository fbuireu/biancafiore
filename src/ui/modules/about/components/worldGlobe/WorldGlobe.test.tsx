import type { CityPoint } from "@modules/about/utils/globe";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WORLD_GLOBE_CONFIG } from "./const";
import { WorldGlobe } from "./WorldGlobe";

const canvasProps = vi.hoisted(() => [] as { points: unknown; width?: number }[]);

vi.mock("./WorldGlobeCanvas", () => ({
	default: (props: { points: unknown; width?: number }) => {
		canvasProps.push(props);

		return <div data-testid="globe-canvas" />;
	},
}));

const observers = vi.hoisted(() => [] as { fire: (isIntersecting: boolean) => void; disconnect: () => void }[]);

const disconnected = vi.hoisted(() => ({ count: 0 }));

class ObserverDouble {
	constructor(private readonly callback: (entries: { isIntersecting: boolean }[]) => void) {
		observers.push({
			fire: (isIntersecting: boolean) => this.callback([{ isIntersecting }]),
			disconnect: () => this.disconnect(),
		});
	}

	observe() {}

	disconnect() {
		disconnected.count += 1;
	}
}

const POINTS: CityPoint[] = [{ lat: 41.4, lng: 2.2, label: "Barcelona", slug: "barcelona" }];

const wrapper = () => document.querySelector(".world-globe-wrapper") as HTMLElement;

const scrollIntoView = async () =>
	act(async () => {
		observers.at(-1)?.fire(true);
	});

const resizeTo = async (innerWidth: number) => {
	vi.stubGlobal("innerWidth", innerWidth);

	await act(async () => {
		window.dispatchEvent(new Event("resize"));
	});
};

beforeEach(() => {
	canvasProps.length = 0;
	observers.length = 0;
	disconnected.count = 0;
	vi.stubGlobal("innerWidth", 1200);
	vi.stubGlobal("IntersectionObserver", ObserverDouble);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("WorldGlobe", () => {
	it("renders no canvas until the reader has scrolled near it", () => {
		render(<WorldGlobe points={POINTS} />);

		expect(screen.queryByTestId("globe-canvas")).toBeNull();
	});

	it("reserves the canvas's height while it is still a placeholder, so nothing jumps", () => {
		render(<WorldGlobe points={POINTS} />);

		expect(wrapper().style.height).toBe(`${WORLD_GLOBE_CONFIG.HEIGHT}px`);
	});

	it("mounts the canvas once the wrapper comes into view", async () => {
		render(<WorldGlobe points={POINTS} />);

		await scrollIntoView();

		expect(screen.getByTestId("globe-canvas")).toBeDefined();
		expect(canvasProps.at(-1)?.points).toBe(POINTS);
	});

	it("drops the reserved height once the canvas owns the space", async () => {
		render(<WorldGlobe points={POINTS} />);

		await scrollIntoView();

		expect(wrapper().style.height).toBe("");
	});

	it("stays mounted once seen, rather than unmounting on the way back out", async () => {
		render(<WorldGlobe points={POINTS} />);
		await scrollIntoView();

		await act(async () => {
			observers.at(-1)?.fire(false);
		});

		expect(screen.getByTestId("globe-canvas")).toBeDefined();
	});

	it("ignores an entry that is not intersecting", async () => {
		render(<WorldGlobe points={POINTS} />);

		await act(async () => {
			observers.at(-1)?.fire(false);
		});

		expect(screen.queryByTestId("globe-canvas")).toBeNull();
	});

	it("stops observing once it has seen the wrapper, so nothing keeps measuring", async () => {
		render(<WorldGlobe points={POINTS} />);

		await scrollIntoView();

		expect(disconnected.count).toBeGreaterThan(0);
	});

	it("sizes itself for a wide viewport", () => {
		vi.stubGlobal("innerWidth", 1200);

		render(<WorldGlobe points={POINTS} />);

		expect(wrapper().style.width).toBe("680px");
	});

	it("leaves the width to the stylesheet on a narrow viewport", () => {
		vi.stubGlobal("innerWidth", 480);

		render(<WorldGlobe points={POINTS} />);

		expect(wrapper().style.width).toBe("");
	});

	it("follows the viewport across a resize", async () => {
		render(<WorldGlobe points={POINTS} />);
		expect(wrapper().style.width).toBe("680px");

		await resizeTo(480);

		expect(wrapper().style.width).toBe("");
	});

	it("lets a caller's width win, and then stops listening for resizes", async () => {
		render(<WorldGlobe points={POINTS} width={320} />);
		expect(wrapper().style.width).toBe("320px");

		await resizeTo(1200);

		expect(wrapper().style.width).toBe("320px");
	});

	it("hands the canvas the width it settled on", async () => {
		render(<WorldGlobe points={POINTS} width={320} />);

		await scrollIntoView();

		expect(canvasProps.at(-1)?.width).toBe(320);
	});

	it("stops listening for resizes once it goes away", async () => {
		const removeEventListener = vi.spyOn(window, "removeEventListener");

		const { unmount } = render(<WorldGlobe points={POINTS} />);
		unmount();

		expect(removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
	});
});
