import { ARTICLE_COLUMNS_STORAGE_KEY } from "../../const";

const SELECTORS = {
	ARTICLE: ".article-wrapper",
	TOGGLE: ".columns-toggle__button",
} as const;

const ACTIVE_CLASS = "--two-columns";

interface ApplyColumnsParams {
	enabled: boolean;
	document: Document;
}

const isColumnsEnabled = (): boolean => localStorage.getItem(ARTICLE_COLUMNS_STORAGE_KEY) === "true";

const applyColumns = ({ enabled, document }: ApplyColumnsParams): void => {
	const ARTICLE = document.querySelector<HTMLElement>(SELECTORS.ARTICLE);
	const TOGGLE = document.querySelector<HTMLButtonElement>(SELECTORS.TOGGLE);

	ARTICLE?.classList.toggle(ACTIVE_CLASS, enabled);
	TOGGLE?.setAttribute("aria-pressed", String(enabled));
};

globalThis.addEventListener("storage", ({ key, newValue }) => {
	if (key === ARTICLE_COLUMNS_STORAGE_KEY) {
		applyColumns({ enabled: newValue === "true", document });
	}
});

document.addEventListener("astro:before-swap", ({ newDocument }) => {
	applyColumns({ enabled: isColumnsEnabled(), document: newDocument });
});

export function initializeColumnsToggle(): void {
	applyColumns({ enabled: isColumnsEnabled(), document });

	const TOGGLE = document.querySelector<HTMLButtonElement>(SELECTORS.TOGGLE);

	if (!TOGGLE) return;

	TOGGLE.addEventListener("click", () => {
		const enabled = !isColumnsEnabled();

		localStorage.setItem(ARTICLE_COLUMNS_STORAGE_KEY, String(enabled));
		applyColumns({ enabled, document });
	});
}
