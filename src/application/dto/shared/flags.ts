export type CmsFlag = boolean | 0 | 1;

export function flagOf(value: CmsFlag | undefined): boolean {
	return value === true || value === 1;
}
