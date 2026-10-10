import { defineLiveCollection } from "astro:content";
import { articles } from "@application/entities/articles";
import { authors } from "@application/entities/authors";
import { cities } from "@application/entities/cities";
import { projects } from "@application/entities/projects";
import { tags } from "@application/entities/tags";
import { testimonials } from "@application/entities/testimonials";
import { emdashLoader } from "emdash/runtime";

export const collections = {
	_emdash: defineLiveCollection({ loader: emdashLoader() }),
	articles: defineLiveCollection(articles),
	authors: defineLiveCollection(authors),
	cities: defineLiveCollection(cities),
	projects: defineLiveCollection(projects),
	tags: defineLiveCollection(tags),
	testimonials: defineLiveCollection(testimonials),
};
