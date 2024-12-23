interface CreateDateParams {
	startDate: string;
	endDate?: string;
}

interface CreateDateReturnType {
	startDate: number;
	endDate?: number | "Present";
}

export function createDate({ startDate, endDate }: CreateDateParams): CreateDateReturnType {
	return {
		startDate: new Date(startDate).getFullYear(),
		endDate: endDate ? new Date(endDate).getFullYear() : "Present",
	};
}
