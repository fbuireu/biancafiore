import biancaCard from "@assets/images/jpg/bianca-fiore-card.jpg";

export const SITE_DEFAULTS = {
	TITLE: "Bianca Fiore",
	DESCRIPTION: "Bianca Fiore: personal website.",
	TITLE_SEPARATOR: " | ",
	IMAGE: biancaCard.src,
	SOCIAL_LINKS: [{ name: "linkedin", url: "https://www.linkedin.com/in/bianca-fiore-88b83199" }],
} as const;
