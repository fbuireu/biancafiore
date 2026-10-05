import { cleanup, render } from "@testing-library/react";
import type { ComponentType, SVGProps } from "react";
import { afterEach, describe, expect, it } from "vitest";
import stretchArrowSvg from "../svg/stretch-arrow.svg?raw";
import { Infinite } from "./infinite/Infinite";
import { StretchArrow } from "./stretchArrow/StretchArrow";
import { ZoomIn } from "./zoomIn/ZoomIn";
import { ZoomOut } from "./zoomOut/ZoomOut";

interface IconProps extends SVGProps<SVGSVGElement> {
	classNames?: string;
	title?: string;
}

const ICONS: [string, ComponentType<IconProps>, string][] = [
	["ZoomIn", ZoomIn, "Zoom In"],
	["ZoomOut", ZoomOut, "Zoom Out"],
	["StretchArrow", StretchArrow, "Arrow"],
	["Infinite", Infinite, "Loading..."],
];

const svgOf = (container: HTMLElement) => container.querySelector("svg") as SVGSVGElement;

afterEach(() => {
	cleanup();
});

describe.each(ICONS)("%s", (_name, Icon, defaultTitle) => {
	it("names itself, so it is not an unlabelled shape to a screen reader", () => {
		const { container } = render(<Icon />);

		expect(svgOf(container).querySelector("title")?.textContent).toBe(defaultTitle);
	});

	it("takes a title of its own, since the same mark labels different controls", () => {
		const { container } = render(<Icon title="Expand the image" />);

		expect(svgOf(container).querySelector("title")?.textContent).toBe("Expand the image");
	});

	it("carries the classes it is handed onto the svg", () => {
		const { container } = render(<Icon classNames="article__zoom" />);

		expect(svgOf(container).getAttribute("class")).toContain("article__zoom");
	});

	it("passes anything else it is given straight to the svg", () => {
		const { container } = render(<Icon aria-hidden="true" data-testid="mark" />);

		expect(svgOf(container).getAttribute("aria-hidden")).toBe("true");
		expect(svgOf(container).getAttribute("data-testid")).toBe("mark");
	});
});

describe("the zoom marks", () => {
	it.each([
		["ZoomIn", ZoomIn],
		["ZoomOut", ZoomOut],
	])("%s inherits the text colour unless a fill is named", (_name, Icon) => {
		const { container } = render(<Icon />);

		expect(svgOf(container).querySelector("circle")?.getAttribute("stroke")).toBe("currentColor");
	});

	it.each([
		["ZoomIn", ZoomIn],
		["ZoomOut", ZoomOut],
	])("%s paints with the fill it is given", (_name, Icon) => {
		const { container } = render(<Icon fill="var(--primary-main)" />);

		expect(svgOf(container).querySelector("circle")?.getAttribute("stroke")).toBe("var(--primary-main)");
	});
});

describe("StretchArrow", () => {
	it("draws the shaft and the tip of the svg the Astro pages inline", () => {
		const { container } = render(<StretchArrow />);
		const drawn = [...container.querySelectorAll("path")].map((path) => [
			path.getAttribute("class"),
			path.getAttribute("d"),
		]);
		const inlined = [...stretchArrowSvg.matchAll(/<path class="([^"]+)" d="([^"]+)"/g)].map(([, name, data]) => [
			name,
			data,
		]);

		expect(inlined).toHaveLength(2);
		expect(drawn).toEqual(inlined);
	});

	it("keeps the block class its stylesheet animates beside the ones it is handed", () => {
		const { container } = render(<StretchArrow classNames="reveal" />);

		expect(svgOf(container).getAttribute("class")).toContain("stretch-arrow");
		expect(svgOf(container).getAttribute("class")).toContain("reveal");
	});
});
