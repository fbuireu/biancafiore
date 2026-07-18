import type { AuthorDTO, AuthorSkeleton, RawAuthor } from "@application/dto/author/types";
import type { Except } from "@const/types";
import { createImage } from "@shared/application/dto/utils/images";
import type { Entry, UnresolvedLink } from "contentful";

type GetAuthorReturn = Except<AuthorDTO, "articles" | "latestArticle">;

export function getAuthor(author: Entry<AuthorSkeleton, undefined> | UnresolvedLink<"Entry">): GetAuthorReturn {
	const rawAuthor = author as RawAuthor;

	return {
		name: rawAuthor.fields.name,
		slug: rawAuthor.fields.slug,
		description: rawAuthor.fields.description,
		jobTitle: rawAuthor.fields.jobTitle,
		currentCompany: rawAuthor.fields.currentCompany,
		profileImage: createImage(rawAuthor.fields.profileImage),
		socialNetworks: rawAuthor.fields.socialNetworks,
	};
}
