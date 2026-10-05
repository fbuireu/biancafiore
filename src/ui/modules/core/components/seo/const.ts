import biancaCard from "@assets/images/jpg/bianca-fiore-card.jpg";
import type { SeoMetadata } from "@const/types";

export const NOINDEX_ROBOTS: NonNullable<SeoMetadata["robots"]> = { index: false, follow: false };

export const DEFAULT_SEO_PARAMS: SeoMetadata = {
	title: "Bianca Fiore",
	description: "Bianca Fiore: personal website.",
	robots: {
		index: true,
		follow: true,
	},
	image: biancaCard.src,
};
