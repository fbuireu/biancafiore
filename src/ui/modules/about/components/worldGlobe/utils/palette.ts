import { THEME_ATTRIBUTE } from "@modules/core/components/themeToggle/const";
import { WORLD_GLOBE_CONFIG } from "../const";

const { LAND_TOKEN, MESH_PHONG_MATERIAL_CONFIG } = WORLD_GLOBE_CONFIG;

export interface GlobePalette {
	land: string;
	ocean: string;
}

export const readColour = (token: string): string => {
	const probe = document.createElement("span");

	probe.style.color = `var(${token})`;
	document.body.append(probe);

	const resolved = getComputedStyle(probe).color;

	probe.remove();

	const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });

	if (!context) return resolved;

	context.fillStyle = resolved;
	context.fillRect(0, 0, 1, 1);

	const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;

	return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
};

export const readGlobePalette = (): GlobePalette => ({
	land: readColour(LAND_TOKEN),
	ocean: readColour(MESH_PHONG_MATERIAL_CONFIG.OCEAN_TOKEN),
});

export const observeTheme = (onChange: () => void): (() => void) => {
	const observer = new MutationObserver(onChange);

	observer.observe(document.documentElement, { attributes: true, attributeFilter: [THEME_ATTRIBUTE] });

	return () => observer.disconnect();
};
