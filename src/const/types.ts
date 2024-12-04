export type CapitalizeKeys<T> = {
	[K in keyof T as Uppercase<K & string>]: T[K] extends object ? CapitalizeKeys<T[K]> : T[K];
};

export type LowercaseKeys<T> = {
	[K in keyof T as Lowercase<K & string>]: T[K] extends object ? LowercaseKeys<T[K]> : T[K];
};

export type Except<T, K extends keyof T> = { [P in keyof T as P extends K ? never : P]: T[P] };

interface MeshPhongMaterialConfig {
	transparent: boolean;
	color: string;
	opacity: number;
}

export interface WorldGlobeConfig {
	animation_duration: number;
	movement_offset: number;
	zoom_offset: number;
	points_merge: boolean;
	animate_in: boolean;
	show_atmosphere: boolean;
	background_color: string;
	hexagon_polygon_color: string;
	mesh_phong_material_config: MeshPhongMaterialConfig;
}

export interface SeoMetadata {
	title: string;
	description: string;
	site: string;
	robots?: {
		index: boolean;
		follow: boolean;
	};
	image: string;
}
