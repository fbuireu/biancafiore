import type { AuthorDTO, RawAuthor } from "@application/dto/author/types.ts";
import type { Asset, Entry, EntrySkeletonType } from "contentful";

type GetAuthorReturnType = Omit<AuthorDTO, "articles" | "latestArticle">;

export function getAuthor(author: Entry<EntrySkeletonType<RawAuthor["fields"]>>): GetAuthorReturnType {
	return {
		name: author.fields.name as unknown as string,
		slug: author.fields.slug as unknown as string,
		description: author.fields.description as unknown as string,
		jobTitle: author.fields.jobTitle as unknown as string,
		currentCompany: author.fields.currentCompany as unknown as string,
		profileImage: (author.fields.profileImage as unknown as Asset).fields.file?.url as unknown as string,
		socialNetworks: author.fields.socialNetworks as unknown as string[],
	};
}
