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
		startDate: Temporal.PlainDate.from(startDate).year,
		endDate: endDate ? Temporal.PlainDate.from(endDate).year : "Present",
	};
}
