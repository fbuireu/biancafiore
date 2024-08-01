import { Pin as pin } from "@assets/images/svg-components/pin";
import type { ReactGlobePoint } from "@components/modules/about/components/worldGlobe";
import { createRoot } from "react-dom/client";

interface RenderPinProps {
	markerData: ReactGlobePoint;
}

export function renderPin({ markerData }: RenderPinProps): HTMLElement {
	const markerWrapper = document.createElement("button");
	markerWrapper.classList.add("marker__wrapper");
	markerWrapper.classList.add(`--is-${markerData.label.toLowerCase()}`);
	const marker = document.createElement("div");
	const root = createRoot(marker);
	root.render(pin({ fill: "currentColor" }));
	markerWrapper.appendChild(marker);
	markerWrapper.onclick = () => console.info("clicked", markerData);

	return markerWrapper;
}
