const TabId = {
	EMAIL: "email",
	APPOINTMENT: "appointment",
} as const;

const SELECTORS = {
	TAB: ".contact-tab",
};

const getTabs = (): NodeListOf<HTMLElement> => document.querySelectorAll(SELECTORS.TAB);

const updateUrl = (tabId: (typeof TabId)[keyof typeof TabId]): void => {
	const { pathname, search } = new URL(window.location.href);
	const params = new URLSearchParams(search);
	params.set("tab", tabId);
	history.pushState({}, "", `${pathname}?${String(params)}`);
};

const changeTab = (tabId: (typeof TabId)[keyof typeof TabId]): void => {
	const TABS = getTabs();

	for (const tab of TABS) {
		const tabContentId = tab.dataset.target;
		const tabContent: HTMLElement | null = document.querySelector(`#${tabContentId}`);

		if (!tabContent) {
			return;
		}

		const isActive = tabContentId === tabId;
		tab.classList.toggle("--is-active", isActive);
		tabContent.classList.toggle("--is-active", isActive);
		tabContent.classList.toggle("--is-hidden", !isActive);
	}
	updateUrl(tabId);
};

export function initTabs(queryTab?: string): void {
	const TABS = getTabs();
	const DEFAULT_TAB = TABS[0].dataset.target as (typeof TabId)[keyof typeof TabId];
	const initialTab = Object.values(TabId).includes(queryTab as (typeof TabId)[keyof typeof TabId])
		? (queryTab as (typeof TabId)[keyof typeof TabId])
		: DEFAULT_TAB;

	for (const tab of TABS) {
		tab.addEventListener("click", () => changeTab(tab.dataset.target as (typeof TabId)[keyof typeof TabId]));
	}

	changeTab(initialTab);
}
