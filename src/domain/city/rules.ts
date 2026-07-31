interface CreateDateParams {
	startDate: string;
	endDate?: string;
}

interface CreateDateReturn {
	startDate: number;
	endDate?: number | "Present";
}

export function createDate({ startDate, endDate }: CreateDateParams): CreateDateReturn {
	return {
		startDate: new Date(startDate).getUTCFullYear(),
		endDate: endDate ? new Date(endDate).getUTCFullYear() : "Present",
	};
}

export function formatPeriod(params: CreateDateParams): string {
	const { startDate, endDate } = createDate(params);

	return `${startDate}-${endDate}`;
}
