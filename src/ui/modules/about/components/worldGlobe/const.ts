export const WORLD_GLOBE_MARKER_CLASS = "world-globe__marker" as const;
export const WORLD_GLOBE_MARKER_LABEL_CLASS = `${WORLD_GLOBE_MARKER_CLASS}__label` as const;

export const WORLD_GLOBE_CONFIG = {
	HEIGHT: 458,
	ANIMATION_DURATION: 500,
	MOVEMENT_OFFSET: 20,
	ZOOM_OFFSET: 0.2,
	ANIMATE_IN: true,
	SHOW_ATMOSPHERE: false,
	BACKGROUND_COLOR: "rgba(255, 255, 255, 0)",
	LAND_TOKEN: "--gold-bright",
	MESH_PHONG_MATERIAL_CONFIG: {
		TRANSPARENT: true,
		OCEAN_TOKEN: "--surface",
		OPACITY: 0.7,
	},
} as const;
