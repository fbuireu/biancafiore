interface Tab {
	id: string;
	target: string;
}

const SELECTORS = {
	TAB: ".contact-tab",
};

function changeTab(tabId: Tab["id"]): void {
	const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(SELECTORS.TAB);

	tabs.forEach((tab) => {
		const tabContentId = tab.dataset.target;
		const tabContent: HTMLElement | null = document.querySelector(`#${tabContentId}`);

		if (!tabContent) return;

		const isActive = tabContentId === tabId;
		tab.classList.toggle("--is-active", isActive);
		tabContent.classList.toggle("--is-active", isActive);
		tabContent.classList.toggle("--is-hidden", !isActive);
	});
}

export function initTabs(): void {
	const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(SELECTORS.TAB);
	tabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			changeTab(tab.dataset.target || "");
		});
	});
	changeTab(tabs[0].dataset.target || "");
}
