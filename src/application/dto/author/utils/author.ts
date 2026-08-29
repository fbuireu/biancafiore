import type { AuthorSkeleton, RawAuthor } from "@application/dto/author/types";
import { createImage } from "@application/dto/shared/images";
import type { Except } from "@const/types";
import type { AuthorDTO } from "@domain/author";
import type { Entry, UnresolvedLink } from "contentful";

type LinkedAuthor = Entry<AuthorSkeleton, undefined> | UnresolvedLink<"Entry">;

function resolvedAuthor(author: LinkedAuthor): RawAuthor {
	if (!("fields" in author)) {
		throw new Error(`A raw author entry reached the mapper unresolved (${author.sys.id}), so no byline can name it`);
	}

	return author as RawAuthor;
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
