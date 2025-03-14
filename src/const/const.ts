import biancaImage from '@assets/images/jpg/bianca-fiore.jpg';
import { capitalizeKeys } from '@const/utils/capitalizeKeys';
import { lowercaseKeys } from '@const/utils/lowercaseKeys';
import { BIANCA_EMAIL } from 'astro:env/client';
import { A11y, Autoplay, Keyboard, Navigation, Virtual } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';
import type { CapitalizeKeys, SeoMetadata, WorldGlobeConfig } from './types';

export const Pages = {
  HOME: 'home',
  PROJECTS: 'projects',
  ABOUT: 'about',
  ARTICLES: 'articles',
  ARTICLE: 'article',
  CONTACT: 'contact',
  TAGS: 'tags',
  TAG: 'tag',
  TERMS_AND_CONDITIONS: 'terms-and-conditions',
  PRIVACY_POLICY: 'privacy-policy',
} as const;

const pagesRoutes = {
  [Pages.ARTICLE]: '/articles/',
  [Pages.ARTICLES]: '/articles',
  [Pages.ABOUT]: '/about',
  [Pages.TAGS]: '/tags',
  [Pages.TAG]: '/tags/',
  [Pages.CONTACT]: '/contact',
  [Pages.PROJECTS]: '/projects',
  [Pages.TERMS_AND_CONDITIONS]: '/terms-and-conditions',
  [Pages.PRIVACY_POLICY]: '/privacy-policy',
  [Pages.HOME]: '/',
} as const;

export const PAGES_ROUTES: CapitalizeKeys<typeof pagesRoutes> = capitalizeKeys(pagesRoutes);

export const DEFAULT_SEO_PARAMS: CapitalizeKeys<SeoMetadata> = {
  TITLE: 'Bianca Fiore',
  SITE: 'biancafiore.me',
  DESCRIPTION: 'Welcome to my website!',
  ROBOTS: {
    INDEX: true,
    FOLLOW: true,
  },
  IMAGE: biancaImage.src,
} as unknown as CapitalizeKeys<SeoMetadata>;

export const CONTACT_DETAILS: Record<CapitalizeKeys<string>, string> = {
  NAME: 'Bianca Fiore',
  EMAIL_SUBJECT: 'Web contact form submission',
  ENCODED_EMAIL_FROM: btoa('hello@biancafiore.me'),
  ENCODED_EMAIL_BIANCA: btoa(BIANCA_EMAIL),
};

export const SOCIAL_NETWORKS: Record<CapitalizeKeys<string>, string> = {
  LINKEDIN: 'https://www.linkedin.com/in/bianca-fiore-88b83199',
};

export const WORLD_GLOBE_CONFIG: CapitalizeKeys<WorldGlobeConfig> = {
  ANIMATION_DURATION: 500,
  MOVEMENT_OFFSET: 20,
  ZOOM_OFFSET: 0.1,
  POINTS_MERGE: true,
  ANIMATE_IN: true,
  SHOW_ATMOSPHERE: false,
  BACKGROUND_COLOR: '#FFFFFF00',
  HEXAGON_POLYGON_COLOR: '#d4a259',
  MESH_PHONG_MATERIAL_CONFIG: {
    TRANSPARENT: true,
    COLOR: '#f7ecd6',
    OPACITY: 0.7,
  },
};

const defaultSwiperConfig: CapitalizeKeys<SwiperOptions> = {
  MODULES: [Navigation, Keyboard, Virtual, Autoplay, A11y],
  LOOP: true,
};

export const DEFAULT_SWIPER_CONFIG: SwiperOptions = lowercaseKeys(defaultSwiperConfig);

const defaultDateFormat: CapitalizeKeys<Intl.DateTimeFormatOptions> = {
  WEEKDAY: 'long',
  YEAR: 'numeric',
  MONTH: 'long',
  DAY: 'numeric',
};
export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = lowercaseKeys(defaultDateFormat);

export const THEME_STORAGE_KEY = 'theme';

export const DEFAULT_LOCALE_STRING: Intl.LocalesArgument = 'es-ES';

export const MAX_RELATED_ARTICLES = 3;

export const MAX_LATEST_ARTICLES = 4;
