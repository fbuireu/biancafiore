import type { CmsByline } from "@infrastructure/cms/entries";

export const AUTHOR_FIELD = {
	JOB_TITLE: "job_title",
	CURRENT_COMPANY: "current_company",
	SOCIAL_NETWORKS: "social_networks",
} as const;

export type RawAuthor = CmsByline;
