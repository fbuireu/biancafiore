interface ParseDatesProps {
	startDate: string;
	endDate?: string;
}

export function createDate({ startDate, endDate }: ParseDatesProps) {
	return {
		startDate: new Date(startDate).getFullYear(),
		endDate: endDate ? new Date(endDate).getFullYear() : "Present",
	};
}
