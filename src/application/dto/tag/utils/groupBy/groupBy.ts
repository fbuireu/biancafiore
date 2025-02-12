interface GroupByParams<T, K> {
	array: T[];
	keyFn: (item: T) => K;
}
export function groupBy<T, K extends string>({ array, keyFn }: GroupByParams<T, K>): Record<K, T[]> {
	const grouped = array.reduce(
		(acc, currentItem) => {
			const key = keyFn(currentItem);
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(currentItem);
			return acc;
		},
		{} as Record<K, T[]>,
	);
	const sortedKeys = Object.keys(grouped).sort((a, b) => a.localeCompare(b)) as K[];
	const sortedGrouped = {} as Record<K, T[]>;
	for (const key of sortedKeys) {
		sortedGrouped[key] = grouped[key];
	}
	return sortedGrouped;
}
