export function groupBy<T, K extends string>(array: T[], keyFn: (item: T) => K): Record<K, T[]> {
	return array.reduce(
		(acc, currentItem) => {
			const key = keyFn(currentItem);

			if (!acc[key]) acc[key] = [];
			acc[key].push(currentItem);

			return acc;
		},
		{} as Record<K, T[]>,
	);
}
