import type { CapitalizeKeys, SeoMetadata, WorldGlobeConfig } from './types.ts';

export const DEFAULT_SEO_PARAMS: CapitalizeKeys<SeoMetadata> = {
  TITLE:"Bianca Fiore",
  DESCRIPTION: "Welcome to my website!",
  ROBOTS: {
    index: true, follow: true
  }
}

export const CONTACT_DETAILS: Record<string, string> = {
  NAME: "Bianca Fiore",
  EMAIL_SUBJECT: "Contact form submission",
  ENCODED_EMAIL_FROM: btoa("hello@biancafiore.me"),
  ENCODED_EMAIL_BIANCA: btoa(import.meta.env.PUBLIC_BIANCA_EMAIL),
};

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

export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const THEME_STORAGE_KEY = "theme";

export const DEFAULT_LOCALE_STRING: Intl.LocalesArgument = "es-ES";

