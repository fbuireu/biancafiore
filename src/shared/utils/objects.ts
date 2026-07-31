interface Named {
	name: string;
}

interface GroupByParams<T extends Named, K> {
	array: T[];
	keyFn: (item: T) => K;
}

export function groupBy<T extends Named, K extends string>({ array, keyFn }: GroupByParams<T, K>): Record<K, T[]> {
	const grouped = Object.groupBy(array, keyFn) as Record<K, T[]>;
	const sortedKeys = Object.keys(grouped).sort((a, b) => a.localeCompare(b)) as K[];
	const sortedGrouped = {} as Record<K, T[]>;
	for (const key of sortedKeys) {
		sortedGrouped[key] = grouped[key].sort((a, b) => a.name.localeCompare(b.name));
	}
	return sortedGrouped;
}
