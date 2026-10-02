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

export function createAuthor(author: LinkedAuthor): Except<AuthorDTO, "latestArticle"> {
	const { fields } = resolvedAuthor(author);

	return {
		name: fields.name.trim(),
		slug: fields.slug.trim(),
		description: fields.description,
		jobTitle: fields.jobTitle,
		currentCompany: fields.currentCompany,
		profileImage: createImage(fields.profileImage),
		socialNetworks: fields.socialNetworks,
	};
}
