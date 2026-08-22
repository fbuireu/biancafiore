import type { CityPeriod } from "@domain/city/types";

const OPEN_END_LABEL = "Present";

interface CityPeriodParams {
	startDate: string;
	endDate?: string;
}

const yearOf = (date: string): number => {
	const year = new Date(date).getUTCFullYear();

	if (Number.isNaN(year)) {
		throw new Error(`A City reached the mapper with an unreadable date: ${date}`);
	}

	return year;
};

export function createPeriod({ startDate, endDate }: CityPeriodParams): CityPeriod {
	return {
		startYear: yearOf(startDate),
		...(endDate && { endYear: yearOf(endDate) }),
	};
}

export function formatPeriod({ startYear, endYear }: CityPeriod): string {
	return `${startYear}-${endYear ?? OPEN_END_LABEL}`;
}
