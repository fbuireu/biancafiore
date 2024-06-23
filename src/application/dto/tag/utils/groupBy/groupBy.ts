interface GroupByProps<T, K> {
	array: T[];
	keyFn: (item: T) => K;
}

export function groupBy<T, K extends string>({ array, keyFn }: GroupByProps<T, K>): Record<K, T[]> {
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
