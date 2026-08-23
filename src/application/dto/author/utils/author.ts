import type { AuthorSkeleton, RawAuthor } from "@application/dto/author/types";
import { createImage } from "@application/dto/shared/images";
import type { Except } from "@const/types";
import type { AuthorDTO } from "@domain/author";
import type { Entry, UnresolvedLink } from "contentful";

export function createAuthor(
	author: Entry<AuthorSkeleton, undefined> | UnresolvedLink<"Entry">,
): Except<AuthorDTO, "latestArticle"> {
	const { fields } = author as RawAuthor;

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
