import type { EntrySkeletonType } from "contentful";

export type SelectedField<SKELETON extends EntrySkeletonType> =
	| "sys.id"
	| `fields.${keyof SKELETON["fields"] & string}`;
