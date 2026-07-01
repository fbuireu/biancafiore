import { Pin as pin } from "@assets/images/svg-components/pin";
import type { ReactGlobePoint } from "@modules/about/components/worldGlobe";
import { slugify } from "@modules/core/utils/slugify";
import { createRoot } from "react-dom/client";

interface RenderPinParams {
	markerData: ReactGlobePoint;
}

export function renderPin({ markerData }: RenderPinParams): HTMLElement {
	const markerWrapper = document.createElement("button");
	markerWrapper.type = "button";
	markerWrapper.classList.add("marker-wrapper", `--is-${slugify(markerData.label)}`);

	const marker = document.createElement("div");
	const root = createRoot(marker);
	root.render(pin({ fill: "currentColor", title: markerData.label }));
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
