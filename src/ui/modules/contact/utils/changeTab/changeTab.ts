enum TabId {
	FORM = "form",
	CALENDLY = "calendly",
}

const SELECTORS = {
	TAB: ".contact-tab",
};

const getTabs = (): NodeListOf<HTMLElement> => document.querySelectorAll(SELECTORS.TAB);

const changeTab = (tabId: TabId) => {
	const TABS = getTabs();

	for (const tab of TABS) {
		const tabContentId = tab.dataset.target;
		const tabContent: HTMLElement | null = document.querySelector(`#${tabContentId}`);

		if (!tabContent) return;

		const isActive = tabContentId === tabId;
		tab.classList.toggle("--is-active", isActive);
		tabContent.classList.toggle("--is-active", isActive);
		tabContent.classList.toggle("--is-hidden", !isActive);
	}
};

export function initTabs() {
	const TABS = getTabs();
	const DEFAULT_TAB = TABS[0].dataset.target as TabId;
	const queryTab = new URLSearchParams(window.location.search).get("tab");
	const initialTab = queryTab === TabId.FORM || queryTab === TabId.CALENDLY ? queryTab : DEFAULT_TAB;

	for (const tab of TABS) {
		tab.addEventListener("click", () => changeTab(tab.dataset.target as TabId));
	}

	changeTab(initialTab);
}
