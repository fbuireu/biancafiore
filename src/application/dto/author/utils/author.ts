import type { Except } from "@const/types";
import type { AuthorDTO } from "@domain/author";
import type { AnyRawArticle } from "../../article/types";
import { createImage } from "../../shared/images";
import { AUTHOR_FIELD, type RawAuthor } from "../types";
import { socialNetworkUrls } from "./socialNetworks";

interface BylineAuthorParams {
	rawArticle: AnyRawArticle;
	rawAuthors: RawAuthor[];
}

interface CreditsParams {
	rawAuthor: RawAuthor;
	rawArticle: AnyRawArticle;
}

const textOf = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

export const credits = ({ rawAuthor, rawArticle }: CreditsParams): boolean =>
	rawArticle.bylines.some(({ id }) => id === rawAuthor.id);

export function creditedAuthors(rawArticles: AnyRawArticle[]): RawAuthor[] {
	return [...new Map(rawArticles.flatMap(({ bylines }) => bylines).map((byline) => [byline.id, byline])).values()];
}

export function bylineAuthor({ rawArticle, rawAuthors }: BylineAuthorParams): RawAuthor {
	const [credited] = rawArticle.bylines;
	const author = credited && rawAuthors.find(({ id }) => id === credited.id);

	if (!author) {
		throw new Error(
			`An Article (${rawArticle.slug ?? rawArticle.id}) is credited to no byline, so no byline can name it`,
		);
	}

	return author;
}

export function authorIdentity(author: RawAuthor): Pick<AuthorDTO, "name" | "slug"> {
	const { id } = author;
	const name = author.displayName.trim();
	const slug = (author.slug ?? "").trim();

	if (!slug) {
		throw new Error(`The Author "${name}" (id ${id}) has no slug, so no page can address them`);
	}

	if (!name) {
		throw new Error(
			`The Author "${slug}" (id ${id}) has an empty name, so the Tag Index cannot file their Author Tag under a letter`,
		);
	}

	return { name, slug };
}

export function createAuthor(rawAuthor: RawAuthor): Except<AuthorDTO, "latestArticle"> {
	const identity = authorIdentity(rawAuthor);
	const { avatar, bio, customFields } = rawAuthor;

	if (!avatar) {
		throw new Error(`The Author "${identity.slug}" (id ${rawAuthor.id}) has no avatar, so no profile image can render`);
	}

	return {
		...identity,
		description: bio ?? "",
		jobTitle: textOf(customFields[AUTHOR_FIELD.JOB_TITLE]),
		currentCompany: textOf(customFields[AUTHOR_FIELD.CURRENT_COMPANY]),
		profileImage: createImage(avatar),
		socialNetworks: socialNetworkUrls(customFields[AUTHOR_FIELD.SOCIAL_NETWORKS]),
	};
}
