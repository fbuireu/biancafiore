interface ParseDatesParams {
	startDate: string;
	endDate?: string;
}

export function createDate({ startDate, endDate }: ParseDatesParams) {
	return {
		startDate: new Date(startDate).getFullYear(),
		endDate: endDate ? new Date(endDate).getFullYear() : "Present",
	};
}
