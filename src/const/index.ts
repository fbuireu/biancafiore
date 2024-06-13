import type { SeoMetadata, WorldGlobeConfig } from './const';

export const DEFAULT_SEO_PARAMS: SeoMetadata = {
  title:"Bianca Fiore" as SeoMetadata["title"],
  description: "Welcome to my website!",
  robots: {
    index: true, follow: true
  }
} 

export const CONTACT_DETAILS: Record<string, string> = {
  name: "Bianca Fiore",
  emailSubject: "Contact form submission",
  encodedEmailFrom: btoa("hello@biancafiore.me"),
  encodedBiancaEmail: btoa("biancamaria.fiore@gmail.com"),
};

export const WORLD_GLOBE_CONFIG: WorldGlobeConfig = {
  animationDuration: 500,
  movementOffset: 20,
  zoomOffset: 0.1,
  pointsMerge: true,
  animateIn: true,
  showAtmosphere: false,
  backgroundColor: "#FFFFFF00",
  hexagonPolygonColor: "#d4a259",
  meshPhongMaterialConfig: {
    transparent: true,
    color: "#f7ecd6",
    opacity: 0.7,
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

