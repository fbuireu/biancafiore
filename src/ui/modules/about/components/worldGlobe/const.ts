import type { CapitalizeKeys, WorldGlobeConfig } from "@const/types.ts";

export const WORLD_GLOBE_CONFIG: CapitalizeKeys<WorldGlobeConfig> = {
	ANIMATION_DURATION: 500,
	MOVEMENT_OFFSET: 20,
	ZOOM_OFFSET: 0.2,
	POINTS_MERGE: true,
	ANIMATE_IN: true,
	SHOW_ATMOSPHERE: false,
	BACKGROUND_COLOR: "#FFFFFF00",
	HEXAGON_POLYGON_COLOR: "#d4a259",
	MESH_PHONG_MATERIAL_CONFIG: {
		TRANSPARENT: true,
		COLOR: "#f7ecd6",
		OPACITY: 0.7,
	},
} as const;
