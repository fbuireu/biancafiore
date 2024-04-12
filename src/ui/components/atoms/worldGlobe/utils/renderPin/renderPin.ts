import { createRoot } from "react-dom/client";
import { Pin as pin } from "@assets/images/svg-components/pin";
import type { ReactGlobePoint } from "@components/atoms/worldGlobe/utils/refineCities";

interface RenderPinParams {
	markerData: ReactGlobePoint;
}

export function renderPin({ markerData }: RenderPinParams): HTMLElement {
	const markerWrapper = document.createElement("button");
	markerWrapper.classList.add(`marker__wrapper`);
	markerWrapper.classList.add(`--is-${markerData.label.toLowerCase()}`);
	const marker = document.createElement("div");
	const root = createRoot(marker);
	root.render(pin());
	markerWrapper.appendChild(marker);
	markerWrapper.onclick = () => console.info(markerData);

	return markerWrapper;
}
