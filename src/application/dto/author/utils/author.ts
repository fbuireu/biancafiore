import type { AuthorSkeleton, RawAuthor } from "@application/dto/author/types";
import type { Except } from "@const/types";
import type { AuthorDTO } from "@domain/author";
import { createImage } from "@shared/application/dto/utils/images";
import type { Entry, UnresolvedLink } from "contentful";

export function createAuthor(
	author: Entry<AuthorSkeleton, undefined> | UnresolvedLink<"Entry">,
): Except<AuthorDTO, "articles" | "latestArticle"> {
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
