export type CapitalizeKeys<T> = {
	[K in keyof T as Uppercase<K & string>]: T[K] extends object ? CapitalizeKeys<T[K]> : T[K];
};

interface MeshPhongMaterialConfig {
	TRANSPARENT: boolean;
	COLOR: string;
	OPACITY: number;
}

export interface WorldGlobeConfig {
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

export interface SeoMetadata {
	title: string;
	description: string;
	robots?: {
		index: boolean;
		follow: boolean;
	};
	image: string;
}
