import type { ReactGlobePoint } from "@modules/about/components/worldGlobe";
import { slugify } from "@modules/core/utils/slugify";

interface RenderPinParams {
	markerData: ReactGlobePoint;
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function createPinSvg({ fill, title }: { fill: string; title: string }): SVGSVGElement {
	const svg = document.createElementNS(SVG_NAMESPACE, "svg");
	svg.setAttribute("viewBox", "-4 0 36 36");

	const titleElement = document.createElementNS(SVG_NAMESPACE, "title");
	titleElement.textContent = title;
	svg.append(titleElement);

	const path = document.createElementNS(SVG_NAMESPACE, "path");
	path.setAttribute("fill", fill);
	path.setAttribute(
		"d",
		"M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z",
	);
	svg.append(path);

	const circle = document.createElementNS(SVG_NAMESPACE, "circle");
	circle.setAttribute("fill", "currentColor");
	circle.setAttribute("cx", "14");
	circle.setAttribute("cy", "14");
	circle.setAttribute("r", "7");
	svg.append(circle);

	return svg;
}

export function renderPin({ markerData }: RenderPinParams): HTMLElement {
	const markerWrapper = document.createElement("button");
	markerWrapper.type = "button";
	markerWrapper.classList.add("marker-wrapper", `--is-${slugify(markerData.label)}`);

	const marker = document.createElement("div");
	marker.append(createPinSvg({ fill: "currentColor", title: markerData.label }));
	markerWrapper.append(marker);

	const label = document.createElement("div");
	label.classList.add("marker__label", "font-sans-serif");
	label.textContent = markerData.label;
	markerWrapper.append(label);

	markerWrapper.onclick = () => {
		const city = document.getElementById(slugify(markerData.label));
		if (!city) {
			return;
		}

		const originalPosition = city.style.position;
		city.style.position = "static";

		let naturalTop = 0;
		for (let node: HTMLElement | null = city; node; node = node.offsetParent as HTMLElement | null) {
			naturalTop += node.offsetTop;
		}

		city.style.position = originalPosition;

		window.scrollTo({ top: Math.max(naturalTop - city.clientHeight / 4, 0), behavior: "smooth" });
	};

	return markerWrapper;
}
