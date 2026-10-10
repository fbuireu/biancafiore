import type { Seo } from "../../seo/utils/pageSeo";

interface EmDashPageFields {
	kind: "custom";
	pageType: Seo["type"];
	title: string;
	pageTitle: string;
	description: string;
	image: string;
	seo: { robots: string };
	articleMeta?: {
		publishedTime: string | null;
		modifiedTime: string | null;
		author: string | null;
	};
}

export function emdashPageFields(seo: Seo): EmDashPageFields {
	return {
		kind: "custom",
		pageType: seo.type,
		title: seo.title,
		pageTitle: seo.title,
		description: seo.description,
		image: seo.image,
		seo: { robots: seo.robots },
		...(seo.type === "article" && {
			articleMeta: {
				publishedTime: seo.publishedTime ?? null,
				modifiedTime: seo.modifiedTime ?? null,
				author: seo.author ?? null,
			},
		}),
	};
}
