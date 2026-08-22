import { absoluteUrl } from "@const/routes";
import { co2 } from "@tgwf/co2";

const BADGE_ID = "carbon-badge";
const GREEN_CHECK_API = "https://api.thegreenwebfoundation.org/api/v3/greencheck";
const GREEN_CHECK_PAGE = "https://www.thegreenwebfoundation.org/green-web-check/?url=";
const GRAMS_PRECISION = 2;

export function transferredBytes(): number {
	const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
	const [navigation] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];

	return resources.reduce((total, resource) => total + (resource.transferSize ?? 0), navigation?.transferSize ?? 0);
}

export async function isGreenHost(hostname: string): Promise<boolean> {
	try {
		const response = await fetch(`${GREEN_CHECK_API}/${hostname}`);
		const { green } = await response.json();

		return green === true;
	} catch {
		return false;
	}
}

interface BadgeMarkupParams {
	grams: string;
	isGreen: boolean;
}

export function badgeMarkup({ grams, isGreen }: BadgeMarkupParams): string {
	const href = `${GREEN_CHECK_PAGE}${encodeURIComponent(absoluteUrl("/"))}`;

	return `
      <a
        href="${href}"
        target="_blank"
        rel="noopener noreferrer"
        class="carbon-badge__link underline-on-hover"
        title="Check this site's carbon footprint"
      >
        ${isGreen ? "♻️ " : ""}${grams}g CO₂/visit · Powered by Green Web Foundation
      </a>
    `;
}

export async function renderCarbonBadge(): Promise<void> {
	const badge = document.getElementById(BADGE_ID);
	const totalBytes = transferredBytes();

	if (!badge || totalBytes === 0) return;

	const isGreen = await isGreenHost(window.location.hostname);
	const grams = new co2({ model: "swd" }).perVisit(totalBytes, isGreen).toFixed(GRAMS_PRECISION);

	badge.innerHTML = badgeMarkup({ grams, isGreen });
}
