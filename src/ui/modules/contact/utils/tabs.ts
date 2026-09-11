import { CALENDLY, CALENDLY_WIDGET_SCRIPT } from "@const/calendly";

const TabId = {
	EMAIL: "email",
	APPOINTMENT: "appointment",
} as const;

type TabId = (typeof TabId)[keyof typeof TabId];

export const TAB_QUERY_KEY = "tab";

const SELECTORS = {
	TAB: ".contact-tab",
	TAB_BUTTON: ".contact-tab button",
	CALENDLY_WIDGET: `.${CALENDLY.WIDGET_CLASS}`,
};

const TAB_IDS: readonly string[] = Object.values(TabId);

const isTabId = (value?: string | null): value is TabId => !!value && TAB_IDS.includes(value);

export function activeTab(url: URL): TabId {
	const requested = url.searchParams.get(TAB_QUERY_KEY);

	return isTabId(requested) ? requested : TabId.EMAIL;
}

const getTabs = (): NodeListOf<HTMLElement> => document.querySelectorAll(SELECTORS.TAB);

const getTabButtons = (): NodeListOf<HTMLElement> => document.querySelectorAll(SELECTORS.TAB_BUTTON);

interface NextTabIndexParams {
	key: string;
	index: number;
	length: number;
}

const nextTabIndex = ({ key, index, length }: NextTabIndexParams): number => {
	if (key === "ArrowRight") return (index + 1) % length;
	if (key === "ArrowLeft") return (index - 1 + length) % length;
	if (key === "Home") return 0;
	if (key === "End") return length - 1;

	return -1;
};

const loadCalendly = (): void => {
	const WIDGET = document.querySelector<HTMLElement>(SELECTORS.CALENDLY_WIDGET);

	if (!WIDGET || WIDGET.dataset.calendlyInitialized === "true") {
		return;
	}

	WIDGET.dataset.calendlyInitialized = "true";

	const calendly = (window as Window & { Calendly?: { initInlineWidgets?: () => void } }).Calendly;

	if (calendly) {
		calendly.initInlineWidgets?.();
		return;
	}

	if (document.querySelector(`script[src="${CALENDLY_WIDGET_SCRIPT}"]`)) {
		return;
	}

	const script = document.createElement("script");
	script.src = CALENDLY_WIDGET_SCRIPT;
	script.async = true;
	script.defer = true;
	document.head.appendChild(script);
};

const applyTab = (tabId: TabId): void => {
	for (const tab of getTabs()) {
		const tabContentId = tab.dataset.target;
		const tabContent: HTMLElement | null = document.querySelector(`#${tabContentId}`);

		if (!tabContent) {
			continue;
		}

		const isActive = tabContentId === tabId;
		tab.classList.toggle("contact-tab--active", isActive);
		tab.classList.toggle("underline-on-hover--active", isActive);
		const button = tab.querySelector<HTMLElement>("button");

		if (button) {
			button.setAttribute("aria-selected", String(isActive));
			button.tabIndex = isActive ? 0 : -1;
		}

		tabContent.classList.toggle("contact-tab__content--active", isActive);
	}

	if (tabId === TabId.APPOINTMENT) {
		loadCalendly();
	}
};

const publishTab = (tabId: TabId): void => {
	const url = new URL(window.location.href);

	url.searchParams.set(TAB_QUERY_KEY, tabId);
	history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
};

function selectTab(event: Event): void {
	const { target } = (event.currentTarget as HTMLElement).dataset;

	if (!isTabId(target)) {
		return;
	}

	applyTab(target);
	publishTab(target);
}

export function initTabs(url: URL = new URL(window.location.href)): void {
	const TABS = getTabs();
	const DEFAULT_TAB = TABS[0]?.dataset.target;

	if (!isTabId(DEFAULT_TAB)) {
		return;
	}

	for (const tab of TABS) {
		tab.addEventListener("click", selectTab);
	}

	const BUTTONS = getTabButtons();

	BUTTONS.forEach((button, index) => {
		button.addEventListener("keydown", (event) => {
			const target = nextTabIndex({ key: (event as KeyboardEvent).key, index, length: BUTTONS.length });

			if (target < 0) {
				return;
			}

			event.preventDefault();
			BUTTONS[target].focus();
			BUTTONS[target].click();
		});
	});

	const REQUESTED_TAB = url.searchParams.get(TAB_QUERY_KEY);

	applyTab(isTabId(REQUESTED_TAB) ? REQUESTED_TAB : DEFAULT_TAB);
}
