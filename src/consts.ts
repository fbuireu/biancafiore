export const SITE_TITLE = 'Bianca Fiore';
export const SITE_DESCRIPTION = 'Welcome to my website!';

export const ENCODED_BIANCA_EMAIL = btoa('biancamaria.fiore@gmail.com');

export const WORLD_GLOBE_CONFIG: Record<string, number | boolean | string | object> = {
    ANIMATION_DURATION: 500,
    MOVEMENT_OFFSET: 20,
    ZOOM_OFFSET: 0.1,
    POINTS_MERGE: true,
    ANIMATE_IN: true,
    SHOW_ATMOSPHERE: false,
    BACKGROUND_COLOR: '#fff',
    HEXAGON_POLYGON_COLOR: '#d4a259',
    MESH_PHONG_MATERIAL_CONFIG: {
        TRANSPARENT: true,
        COLOR: '#f7ecd6',
        OPACITY: 0.7,
    },
};

export const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
};
