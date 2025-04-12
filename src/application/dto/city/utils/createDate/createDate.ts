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
		startDate: new Date(startDate).getFullYear(),
		endDate: endDate ? new Date(endDate).getFullYear() : "Present",
	};
}
