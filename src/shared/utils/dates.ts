import { DEFAULT_DATE_FORMAT, DEFAULT_LOCALE_STRING } from "@const/index";

export function formatDate(date: string | Date): string {
	return new Date(date).toLocaleDateString(DEFAULT_LOCALE_STRING, { ...DEFAULT_DATE_FORMAT, timeZone: "UTC" });
}
