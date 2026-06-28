import biancaImage from "@assets/images/jpg/bianca-fiore.jpg";
import type { SeoMetadata } from "@const/types";

export const DEFAULT_SEO_PARAMS: SeoMetadata = {
	title: "Bianca Fiore",
	site: "biancafiore.me",
	description: "Bianca Fiore — personal website.",
	robots: {
		index: true,
		follow: true,
	},
	image: biancaImage.src,
};
