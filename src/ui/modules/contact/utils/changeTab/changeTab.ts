interface Tab {
	id: string;
	target: string;
}

const SELECTORS = {
	TAB: ".contact-tab",
};

const changeTab = (tabId: Tab["id"]) => {
	const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(SELECTORS.TAB);

	for (const tab of tabs) {
		const tabContentId = tab.dataset.target;
		const tabContent: HTMLElement | null = document.querySelector(`#${tabContentId}`);

		if (!tabContent) continue;

		const isActive = tabContentId === tabId;
		tab.classList.toggle("--is-active", isActive);
		tabContent.classList.toggle("--is-active", isActive);
		tabContent.classList.toggle("--is-hidden", !isActive);
	}
};

export function initTabs() {
	const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(SELECTORS.TAB);

	for (const tab of tabs) {
		tab.addEventListener("click", () => {
			changeTab(tab.dataset.target ?? "");
		});
	}
	changeTab(tabs[0].dataset.target ?? "");
}
