import type { Except } from "@const/types";
import type { AuthorDTO } from "@domain/author";
import type { UnresolvedLink } from "contentful";
import { createImage } from "../../shared/images";
import type { RawAuthor } from "../types";

type LinkedAuthor = RawAuthor | UnresolvedLink<"Entry">;

function resolvedAuthor(author: LinkedAuthor): RawAuthor {
	if (!("fields" in author)) {
		throw new Error(`A raw author entry reached the mapper unresolved (${author.sys.id}), so no byline can name it`);
	}

	return author;
}

interface RawAuthorIdentity {
	sys?: { id?: string };
	fields: { name: string; slug: string };
}

interface RawAuthored {
	fields: { author: LinkedAuthor };
}

const entryOf = ({ sys }: Pick<RawAuthorIdentity, "sys">): string => (sys?.id ? ` (sys.id ${sys.id})` : "");

export function authorIdentity(author: RawAuthorIdentity): Pick<AuthorDTO, "name" | "slug"> {
	const name = author.fields.name.trim();
	const slug = author.fields.slug.trim();

	if (!slug) {
		throw new Error(`The Author "${name}"${entryOf(author)} has no slug, so no page can address them`);
	}

	if (!name) {
		throw new Error(
			`The Author "${slug}"${entryOf(author)} has an empty name, so the Tag Index cannot file their Author Tag under a letter`,
		);
	}

	return { name, slug };
}

export function articleAuthorSlug({ fields }: RawAuthored): string | undefined {
	return "fields" in fields.author ? authorIdentity(fields.author).slug : undefined;
}

export function createAuthor(author: LinkedAuthor): Except<AuthorDTO, "latestArticle"> {
	const resolved = resolvedAuthor(author);
	const { fields } = resolved;

	return {
		...authorIdentity(resolved),
		description: fields.description,
		jobTitle: fields.jobTitle,
		currentCompany: fields.currentCompany,
		profileImage: createImage(fields.profileImage),
		socialNetworks: fields.socialNetworks,
	};
}
