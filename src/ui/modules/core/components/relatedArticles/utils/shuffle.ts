export function shuffle<T>(entries: T[]): T[] {
	const shuffled = [...entries];

	for (let index = shuffled.length - 1; index > 0; index--) {
		const swap = Math.floor(Math.random() * (index + 1));
		const held = shuffled[index] as T;

		shuffled[index] = shuffled[swap] as T;
		shuffled[swap] = held;
	}

	return shuffled;
}
