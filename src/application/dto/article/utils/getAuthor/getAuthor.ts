import type { ContentfulImageAsset } from "@application/dto/article/types.ts";
import type { AuthorDTO, ProfileImage, RawAuthor } from "@application/dto/author/types.ts";
import type { Asset, Entry, EntrySkeletonType } from "contentful";

type GetAuthorReturnType = Omit<AuthorDTO, "articles" | "latestArticle">;

export function getAuthor(author: Entry<EntrySkeletonType<RawAuthor["fields"]>>): GetAuthorReturnType {
	const profileImage = {
		url: (author.fields.profileImage as unknown as Asset).fields.file?.url,
		details: {
			width: (author.fields.profileImage as unknown as ContentfulImageAsset).fields.file.details?.image?.width,
			height: (author.fields.profileImage as unknown as ContentfulImageAsset).fields.file.details?.image?.height,
		},
	} as ProfileImage;

	return {
		name: author.fields.name as unknown as string,
		slug: author.fields.slug as unknown as string,
		description: author.fields.description as unknown as string,
		jobTitle: author.fields.jobTitle as unknown as string,
		currentCompany: author.fields.currentCompany as unknown as string,
		profileImage,
		socialNetworks: author.fields.socialNetworks as unknown as string[],
	};
}
