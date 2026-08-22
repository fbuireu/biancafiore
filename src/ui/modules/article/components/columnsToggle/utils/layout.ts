import { ARTICLE_COLUMNS_STORAGE_KEY } from "../const";

const SELECTORS = {
	ARTICLE: ".article-wrapper",
	TOGGLE: ".columns-toggle__button",
} as const;
const ACTIVE_CLASS = "article-wrapper--two-columns";

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

const applyOnOtherTabWrite = ({ key, newValue }: StorageEvent): void => {
	if (key === ARTICLE_COLUMNS_STORAGE_KEY) {
		applyColumns({ enabled: newValue === "true", document });
	}
};

const applyBeforeSwap = (event: Event): void => {
	const { newDocument } = event as Event & { newDocument: Document };

	applyColumns({ enabled: isColumnsEnabled(), document: newDocument });
};

export function initializeColumnsToggle(): void {
	globalThis.addEventListener("storage", applyOnOtherTabWrite);
	document.addEventListener("astro:before-swap", applyBeforeSwap);
	applyColumns({ enabled: isColumnsEnabled(), document });

	const TOGGLE = document.querySelector<HTMLButtonElement>(SELECTORS.TOGGLE);

	if (!TOGGLE) return;

	TOGGLE.addEventListener("click", () => {
		const enabled = !isColumnsEnabled();

		localStorage.setItem(ARTICLE_COLUMNS_STORAGE_KEY, String(enabled));
		applyColumns({ enabled, document });
	});
}
