import type { AuthorDTO, RawAuthor } from "@application/dto/author/types";
import type { Except } from "@const/types";
import { createImage } from "@shared/application/dto/utils/createImage";
import type { Entry, EntrySkeletonType } from "contentful";

type GetAuthorReturn = Except<AuthorDTO, "articles" | "latestArticle">;

export function getAuthor(author: Entry<EntrySkeletonType<RawAuthor["fields"]>>): GetAuthorReturn {
	const profileImage = createImage(
		author.fields.profileImage as unknown as Entry<EntrySkeletonType<RawAuthor["fields"]["profileImage"]["fields"]>>,
	);

	return {
		name: author.fields.name as string,
		slug: author.fields.slug as string,
		description: author.fields.description as string,
		jobTitle: author.fields.jobTitle as string,
		currentCompany: author.fields.currentCompany as string,
		profileImage,
		socialNetworks: author.fields.socialNetworks as string[],
	};
}
