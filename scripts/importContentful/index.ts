import { type ContentfulAsset, type ContentfulEntry, contentTypeOf, linkedId, readSpace } from "./contentful.ts";
import { type EmDashWriter, type EntryBody, emdashWriter } from "./emdash.ts";
import {
	articleBody,
	authorBody,
	cityBody,
	type MapEntryParams,
	projectBody,
	relatedArticleIds,
	tagTerm,
	tagTermIds,
	testimonialBody,
} from "./fields.ts";
import { assetIdsIn, type UploadedMedia } from "./portableText.ts";
import { preflight, unuploadableAsset } from "./preflight.ts";

interface Migration {
	contentType: string;
	collection: string;
	body: (params: MapEntryParams) => EntryBody;
}

interface AssetIdsOfParams {
	migrated: ContentfulEntry[];
	entries: Map<string, ContentfulEntry>;
}

interface UploadMediaParams {
	assetIds: string[];
	assets: Map<string, ContentfulAsset>;
	writer: EmDashWriter;
	warnings: string[];
}

const TAG_TAXONOMY = "tag";

const MIGRATIONS: Migration[] = [
	{ contentType: "author", collection: "authors", body: authorBody },
	{ contentType: "city", collection: "cities", body: cityBody },
	{ contentType: "project", collection: "projects", body: projectBody },
	{ contentType: "testimonial", collection: "testimonials", body: testimonialBody },
	{ contentType: "article", collection: "articles", body: articleBody },
];

const IMAGE_FIELDS = ["featuredImage", "profileImage", "image"];
const RICH_TEXT_FIELDS = ["content", "description"];

const DRY_RUN = process.argv.includes("--dry-run");

const say = (line: string) => process.stdout.write(`${line}\n`);

function required(name: string): string {
	const value = process.env[name];

	if (!value) throw new Error(`${name} must be set (cms/.dev.vars is read when it exists)`);

	return value;
}

function assetIdsOf({ migrated, entries }: AssetIdsOfParams): string[] {
	const ids = migrated.flatMap((entry) => [
		...IMAGE_FIELDS.flatMap((field) => linkedId(entry.fields[field]) ?? []),
		...RICH_TEXT_FIELDS.flatMap((field) => assetIdsIn({ document: entry.fields[field], entries })),
	]);

	return [...new Set(ids)];
}

async function uploadMedia({
	assetIds,
	assets,
	writer,
	warnings,
}: UploadMediaParams): Promise<Map<string, UploadedMedia>> {
	const media = new Map<string, UploadedMedia>();

	for (const assetId of assetIds) {
		const asset = assets.get(assetId);
		const file = asset?.fields.file;
		const refused = unuploadableAsset(asset);

		if (!file) {
			warnings.push(`asset ${assetId} is not published or has no file, so whatever shows it is left without it`);
			continue;
		}
		if (refused) {
			warnings.push(
				`asset ${file.fileName} is ${refused}, which EmDash refuses to store, so whatever shows it is left without it`,
			);
			continue;
		}

		if (DRY_RUN) {
			media.set(assetId, {
				id: `dry-${assetId}`,
				url: `/_emdash/api/media/file/${file.fileName}`,
				storageKey: file.fileName,
				filename: file.fileName,
				mimeType: file.contentType,
				...file.details?.image,
			});
			continue;
		}

		const response = await fetch(`https:${file.url}`);

		if (!response.ok) throw new Error(`Contentful's CDN answered ${response.status} for ${file.url}`);

		media.set(
			assetId,
			await writer.uploadMedia({
				bytes: await response.arrayBuffer(),
				filename: file.fileName,
				contentType: file.contentType,
			}),
		);
		say(`  ↑ ${file.fileName}`);
	}

	return media;
}

async function main(): Promise<void> {
	const writer = emdashWriter({ url: required("EMDASH_URL"), token: required("EMDASH_TOKEN") });

	if (!DRY_RUN) {
		for (const { collection } of MIGRATIONS) {
			if ((await writer.countEntries(collection)) > 0) {
				throw new Error(
					`${collection} already holds entries: the import is not resumable, so empty the CMS's database and run it again`,
				);
			}
		}
		if ((await writer.countTerms(TAG_TAXONOMY)) > 0) {
			throw new Error(
				"the tag taxonomy already holds terms: the import is not resumable, so empty it and run it again",
			);
		}
	}

	say("Reading Contentful…");
	const space = await readSpace({
		space: required("CONTENTFUL_SPACE_ID"),
		token: required("CONTENTFUL_DELIVERY_TOKEN"),
		environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
	});
	const entries = new Map(space.entries.map((entry) => [entry.sys.id, entry]));
	const assets = new Map(space.assets.map((asset) => [asset.sys.id, asset]));
	const migrated = space.entries.filter((entry) =>
		MIGRATIONS.some(({ contentType }) => contentType === contentTypeOf(entry)),
	);
	const tags = space.entries.filter((entry) => contentTypeOf(entry) === "tag");

	const checked = preflight({ migrated, entries });
	const warnings = [...checked.warnings];

	if (checked.errors.length > 0) {
		throw new Error(`Nothing was written:\n${checked.errors.map((error) => `  ✗ ${error}`).join("\n")}`);
	}

	say(`Uploading media${DRY_RUN ? " (dry run)" : ""}…`);
	const media = await uploadMedia({ assetIds: assetIdsOf({ migrated, entries }), assets, writer, warnings });

	let key = 0;
	const ids = new Map<string, string>();
	const context = { entries, assets, media, ids, warnings, nextKey: () => `k${(key++).toString(36)}` };
	const articles: Array<{ entry: ContentfulEntry; id: string }> = [];

	say(`Creating ${tags.length} tags…`);

	for (const entry of tags) {
		const id = DRY_RUN
			? `dry-${entry.sys.id}`
			: await writer.createTerm({ taxonomy: TAG_TAXONOMY, body: tagTerm({ entry }) });

		ids.set(entry.sys.id, id);
	}

	for (const migration of MIGRATIONS) {
		const batch = space.entries.filter((entry) => contentTypeOf(entry) === migration.contentType);

		say(`Creating ${batch.length} ${migration.collection}…`);

		for (const entry of batch) {
			const body = migration.body({ entry, context });
			const id = DRY_RUN ? `dry-${entry.sys.id}` : await writer.create({ collection: migration.collection, body });

			ids.set(entry.sys.id, id);

			if (migration.collection === "articles") {
				const termIds = tagTermIds({ entry, context });

				if (!DRY_RUN && termIds.length > 0) {
					await writer.setTerms({ collection: "articles", id, taxonomy: TAG_TAXONOMY, termIds });
				}

				articles.push({ entry, id });
			} else if (!DRY_RUN) {
				await writer.publish({ collection: migration.collection, id });
			}
		}
	}

	say("Linking related articles and publishing articles…");

	for (const { entry, id } of articles) {
		const related = relatedArticleIds({ entry, context });

		if (DRY_RUN) continue;
		if (related.length > 0) {
			await writer.updateReferences({ collection: "articles", id, references: { related_articles: related } });
		}

		await writer.publish({ collection: "articles", id });
	}

	for (const warning of new Set(warnings)) say(`  ! ${warning}`);

	say(`Done: ${ids.size} entries, ${media.size} media${DRY_RUN ? ", nothing written (dry run)" : ""}.`);
}

main().catch((error: unknown) => {
	process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
	process.exitCode = 1;
});
