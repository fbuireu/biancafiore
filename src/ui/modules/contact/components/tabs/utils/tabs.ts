import { CALENDLY, CALENDLY_WIDGET_SCRIPT } from "@const/calendly";
import { z } from "@shared/utils/zod";
import { TAB_ACTIVE_CLASS, TAB_CLASS, TAB_CONTENT_ACTIVE_CLASS, TAB_QUERY_KEY, TabId } from "../const";

const SELECTORS = {
	TAB: `.${TAB_CLASS}`,
	TAB_BUTTON: `.${TAB_CLASS} button`,
	CALENDLY_WIDGET: `.${CALENDLY.WIDGET_CLASS}`,
};

const tabIdSchema = z.enum(TabId);

const selectedTabSchema = z.object({ dataset: z.object({ target: tabIdSchema }) });

const calendlySchema = z.object({ initInlineWidgets: z.function().optional() });

export function activeTab(url: URL): TabId {
	const requested = url.searchParams.get(TAB_QUERY_KEY);

	return tabIdSchema.validate(requested) ? requested : TabId.EMAIL;
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

	const calendly = "Calendly" in window ? window.Calendly : undefined;

	if (calendlySchema.validate(calendly)) {
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
		tab.classList.toggle(TAB_ACTIVE_CLASS, isActive);
		tab.classList.toggle("underline-on-hover--active", isActive);
		const button = tab.querySelector<HTMLElement>("button");

		if (button) {
			button.setAttribute("aria-selected", String(isActive));
			button.tabIndex = isActive ? 0 : -1;
		}

		tabContent.classList.toggle(TAB_CONTENT_ACTIVE_CLASS, isActive);
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

function selectTab({ currentTarget }: Event): void {
	if (!selectedTabSchema.validate(currentTarget)) {
		return;
	}

	const { target } = currentTarget.dataset;

	applyTab(target);
	publishTab(target);
}

export function initTabs(): void {
	const TABS = getTabs();
	const DEFAULT_TAB = TABS[0]?.dataset.target;

	if (!tabIdSchema.validate(DEFAULT_TAB)) {
		return;
	}

	for (const tab of TABS) {
		tab.addEventListener("click", selectTab);
	}

	const BUTTONS = getTabButtons();

	BUTTONS.forEach((button, index) => {
		button.addEventListener("keydown", (event) => {
			const target = nextTabIndex({ key: event.key, index, length: BUTTONS.length });

			if (target < 0) {
				return;
			}

			event.preventDefault();
			BUTTONS[target].focus();
			BUTTONS[target].click();
		});
	});

	const REQUESTED_TAB = new URL(window.location.href).searchParams.get(TAB_QUERY_KEY);

	applyTab(tabIdSchema.validate(REQUESTED_TAB) ? REQUESTED_TAB : DEFAULT_TAB);
}
