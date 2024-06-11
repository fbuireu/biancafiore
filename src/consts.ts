export const SITE_TITLE = "Bianca Fiore";
export const SITE_DESCRIPTION = "Welcome to my website!";

export const CONTACT_DETAILS: Record<string, string> = {
	NAME: "Bianca Fiore",
	EMAIL_SUBJECT: "Contact form submission",
	ENCODED_EMAIL_FROM: btoa("hello@biancafiore.me"),
	ENCODED_BIANCA_EMAIL: btoa("biancamaria.fiore@gmail.com"),
};

export const THEME_STORAGE_KEY = "theme";

//todo: isolate types
interface MeshPhongMaterialConfig {
	TRANSPARENT: boolean;
	COLOR: string;
	OPACITY: number;
}

interface WorldGlobeConfig {
	ANIMATION_DURATION: number;
	MOVEMENT_OFFSET: number;
	ZOOM_OFFSET: number;
	POINTS_MERGE: boolean;
	ANIMATE_IN: boolean;
	SHOW_ATMOSPHERE: boolean;
	BACKGROUND_COLOR: string;
	HEXAGON_POLYGON_COLOR: string;
	MESH_PHONG_MATERIAL_CONFIG: MeshPhongMaterialConfig;
}

export const WORLD_GLOBE_CONFIG: WorldGlobeConfig = {
	ANIMATION_DURATION: 500,
	MOVEMENT_OFFSET: 20,
	ZOOM_OFFSET: 0.1,
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
};

export const DEFAULT_LOCALE_STRING: Intl.LocalesArgument = "es-ES";

export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
};
