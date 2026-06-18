import { defineLiveCollection } from "astro:content";
import {
	articlesLoader,
	authorsLoader,
	citiesLoader,
	projectsLoader,
	tagsLoader,
	testimonialsLoader,
} from "@infrastructure/cms/loaders";

/**
 * Live content collections backed by EmDash. Queried at request time with
 * `getLiveCollection` / `getLiveEntry`, so publishing changes go live without a
 * rebuild. The build-time `content.config.ts` collections remain (empty loaders)
 * only to generate the `CollectionEntry<T>` types the UI components rely on.
 *
 * @see https://docs.astro.build/en/guides/content-collections/#live-content-collections
 */
export const collections = {
	articles: defineLiveCollection({ loader: articlesLoader }),
	authors: defineLiveCollection({ loader: authorsLoader }),
	tags: defineLiveCollection({ loader: tagsLoader }),
	cities: defineLiveCollection({ loader: citiesLoader }),
	projects: defineLiveCollection({ loader: projectsLoader }),
	testimonials: defineLiveCollection({ loader: testimonialsLoader }),
};
