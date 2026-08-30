import { Infinite } from "@assets/images/svg-components/infinite/Infinite";
import { StretchArrow } from "@assets/images/svg-components/stretchArrow/StretchArrow";
import { ZoomIn } from "@assets/images/svg-components/zoomIn/ZoomIn";
import { ZoomOut } from "@assets/images/svg-components/zoomOut/ZoomOut";
import { cleanup, render } from "@testing-library/react";
import type { ComponentType, SVGProps } from "react";
import { afterEach, describe, expect, it } from "vitest";

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

	it("adds the classes it is handed rather than replacing its own", () => {
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
	it("keeps the block class its stylesheet animates", () => {
		const { container } = render(<StretchArrow classNames="reveal" />);

		expect(svgOf(container).getAttribute("class")).toContain("stretch-arrow");
	});
});
