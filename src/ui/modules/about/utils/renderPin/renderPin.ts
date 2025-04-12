import type { CollectionEntry } from "astro:content";
import { Pin as pin } from "@assets/images/svg-components/pin";
import type { ReactGlobePoint } from "@modules/about/components/worldGlobe";
import { slugify } from "@modules/core/utils/slugify";
import { createRoot } from "react-dom/client";

interface RenderPinParams {
	markerData: ReactGlobePoint;
	cities: CollectionEntry<"cities">[];
}

export function renderPin({ markerData, cities }: RenderPinParams): HTMLElement {
	const citiesInitialPosition = cities.map(({ data }) => document.querySelector(`#${slugify(data.name)}`)?.offsetTop);

	const markerWrapper = document.createElement("button");
	markerWrapper.classList.add("marker__wrapper", `--is-${slugify(markerData.label)}`);

	const marker = document.createElement("div");
	const root = createRoot(marker);
	root.render(pin({ fill: "currentColor", title: markerData.label }));
	markerWrapper.append(marker);

	const label = document.createElement("div");
	label.classList.add("marker__label", "font-sans-serif");
	label.textContent = markerData.label;
	markerWrapper.append(label);

	markerWrapper.onclick = () => {
		const city = document.querySelector(`#${slugify(markerData.label)}`);
		if (!city) {
			return;
		}

		const cityIndex = Number(getComputedStyle(city).getPropertyValue("--inline-index"));
		const cityPosition = citiesInitialPosition[cityIndex - 1];

		if (cityIndex < 1 || cityIndex > citiesInitialPosition.length || !cityPosition) {
			return;
		}

		window.scrollTo({
			top: cityPosition - city.clientHeight / 4,
			behavior: "smooth",
		});
	};

	return markerWrapper;
}
