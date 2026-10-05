import { CALENDLY, CALENDLY_WIDGET_SCRIPT } from "@const/calendly";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	TAB_ACTIVE_CLASS,
	TAB_CLASS,
	TAB_CONTENT_ACTIVE_CLASS,
	TAB_CONTENT_CLASS,
	TAB_QUERY_KEY,
	TabId,
} from "../const";
import { activeTab, initTabs } from "./tabs";

const CONTACT_PATH = "/contact";

const renderTabs = (booking = false): void => {
	document.body.innerHTML = `
		<ul>
			<li class="${TAB_CLASS}" data-target="${TabId.EMAIL}"><button type="button">Email me</button></li>
			<li class="${TAB_CLASS}" data-target="${TabId.APPOINTMENT}"><button type="button">Make an appointment</button></li>
		</ul>
		<div id="${TabId.EMAIL}" class="${TAB_CONTENT_CLASS} ${TAB_CONTENT_ACTIVE_CLASS}"></div>
		<div id="${TabId.APPOINTMENT}" class="${TAB_CONTENT_CLASS}">
			${booking ? `<div class="${CALENDLY.WIDGET_CLASS}"></div>` : ""}
		</div>
	`;
};

const bookingWidget = () => {
	const initInlineWidgets = vi.fn();

	Object.assign(window, { Calendly: { initInlineWidgets } });

	return initInlineWidgets;
};

const tab = (target: string): HTMLElement => {
	const element = document.querySelector<HTMLElement>(`.${TAB_CLASS}[data-target="${target}"]`);

	if (!element) {
		throw new Error(`no tab for ${target}`);
	}

	return element;
};

const tabButton = (target: string): HTMLElement => {
	const button = tab(target).querySelector<HTMLElement>("button");

	if (!button) {
		throw new Error(`no button for ${target}`);
	}

	return button;
};

interface PressParams {
	target: string;
	key: string;
}

const press = ({ target, key }: PressParams): void => {
	tabButton(target).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
};

const paintedTab = (): string | undefined =>
	document.querySelector<HTMLElement>(`.${TAB_CONTENT_ACTIVE_CLASS}`)?.id ??
	document.querySelector<HTMLElement>(`.${TAB_ACTIVE_CLASS}`)?.dataset.target;

const visit = (search: string): void => {
	history.replaceState({ index: 0 }, "", `${CONTACT_PATH}${search}`);
};

const ORIGINAL_URL = window.location.href;

const watchHistory = () => ({
	push: vi.spyOn(history, "pushState"),
	replace: vi.spyOn(history, "replaceState"),
});

beforeEach(() => {
	history.replaceState({ index: 0 }, "", CONTACT_PATH);
	renderTabs();
});

afterEach(() => {
	vi.restoreAllMocks();
	history.replaceState(null, "", ORIGINAL_URL);
	Reflect.deleteProperty(window, "Calendly");
	document.body.innerHTML = "";
});

describe("initTabs", () => {
	it("restores the tab a link asked for without adding a history entry", () => {
		visit(`?${TAB_QUERY_KEY}=appointment`);
		const { push, replace } = watchHistory();

		initTabs();

		expect(paintedTab()).toBe("appointment");
		expect(push).not.toHaveBeenCalled();
		expect(replace).not.toHaveBeenCalled();
	});

	it("shows the first tab when the URL asks for none, and still writes nothing", () => {
		const { push, replace } = watchHistory();

		initTabs();

		expect(paintedTab()).toBe("email");
		expect(push).not.toHaveBeenCalled();
		expect(replace).not.toHaveBeenCalled();
	});

	it("falls back to the first tab when the URL asks for one that does not exist", () => {
		visit(`?${TAB_QUERY_KEY}=carrier-pigeon`);
		const { push, replace } = watchHistory();

		initTabs();

		expect(paintedTab()).toBe("email");
		expect(push).not.toHaveBeenCalled();
		expect(replace).not.toHaveBeenCalled();
	});

	it("reads the query string of the page, and takes no URL of its own", () => {
		visit(`?${TAB_QUERY_KEY}=appointment`);

		// @ts-expect-error the page's own URL is the only one it reads
		initTabs(new URL(`${CONTACT_PATH}?${TAB_QUERY_KEY}=email`, window.location.href));

		expect(paintedTab()).toBe("appointment");
	});

	it("does nothing on a page that carries no tabs", () => {
		document.body.innerHTML = "";
		const { push, replace } = watchHistory();

		expect(() => initTabs()).not.toThrow();
		expect(push).not.toHaveBeenCalled();
		expect(replace).not.toHaveBeenCalled();
	});
});

describe("choosing a tab", () => {
	it("replaces the current entry rather than pushing a new one, so Back still leaves the page", () => {
		const { push, replace } = watchHistory();

		initTabs();
		tab("appointment").click();

		expect(paintedTab()).toBe("appointment");
		expect(push).not.toHaveBeenCalled();
		expect(replace).toHaveBeenCalledTimes(1);
		expect(replace).toHaveBeenCalledWith(expect.anything(), "", `${CONTACT_PATH}?${TAB_QUERY_KEY}=appointment`);
	});

	it("keeps the router's own history state instead of blanking it", () => {
		const state = { index: 7 };

		history.replaceState(state, "", CONTACT_PATH);

		const { replace } = watchHistory();

		initTabs();
		tab("appointment").click();

		expect(replace.mock.calls[0]?.[0]).toEqual(state);
	});

	it("publishes the tab under the key it reads back, so a shared URL restores it", () => {
		initTabs();
		tab("appointment").click();

		renderTabs();
		initTabs();

		expect(paintedTab()).toBe("appointment");
	});

	it("keeps the rest of the query string and the fragment", () => {
		history.replaceState({ index: 0 }, "", `${CONTACT_PATH}?utm_source=newsletter#form`);

		const { replace } = watchHistory();

		initTabs();
		tab("appointment").click();

		expect(replace).toHaveBeenCalledWith(
			expect.anything(),
			"",
			`${CONTACT_PATH}?utm_source=newsletter&${TAB_QUERY_KEY}=appointment#form`,
		);
	});

	it("boots the booking widget the appointment tab needs, once", () => {
		renderTabs(true);

		const initInlineWidgets = bookingWidget();

		initTabs();
		tab("appointment").click();
		tab("email").click();
		tab("appointment").click();

		expect(initInlineWidgets).toHaveBeenCalledTimes(1);
	});

	it("wires a tab once, however often the page is initialised", () => {
		initTabs();
		initTabs();

		const { replace } = watchHistory();

		tab("appointment").click();

		expect(replace).toHaveBeenCalledTimes(1);
	});
});

describe("a tab naming no known panel", () => {
	it("ignores a click on it rather than publishing what it names", () => {
		const stray = document.createElement("li");
		stray.className = TAB_CLASS;
		stray.dataset.target = "carrier-pigeon";
		document.querySelector("ul")?.append(stray);
		initTabs();
		const { replace } = watchHistory();

		stray.click();

		expect(replace).not.toHaveBeenCalled();
		expect(paintedTab()).toBe("email");
	});
});

describe("activeTab", () => {
	it.each([
		["names a tab", "appointment", "appointment"],
		["names the default", "email", "email"],
		["names nothing the module knows", "carrier-pigeon", "email"],
		["is empty", "", "email"],
	])("answers %s with the tab the server should render", (_name, requested, expected) => {
		const url = new URL(`https://biancafiore.test/contact?${TAB_QUERY_KEY}=${requested}`);

		expect(activeTab(url)).toBe(expected);
	});

	it("answers the default when the link carries no tab at all", () => {
		expect(activeTab(new URL("https://biancafiore.test/contact"))).toBe("email");
	});
});

describe("the appointment widget", () => {
	const appended: HTMLScriptElement[] = [];

	const injectedScripts = () => appended.filter((script) => script.src === CALENDLY_WIDGET_SCRIPT);

	const widget = () => document.querySelector<HTMLElement>(`.${CALENDLY.WIDGET_CLASS}`) as HTMLElement;

	const alreadyOnThePage = () => {
		const script = document.createElement("script");

		script.type = "text/plain";
		script.src = CALENDLY_WIDGET_SCRIPT;
		document.head.insertBefore(script, null);
	};

	beforeEach(() => {
		appended.length = 0;
		vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
			appended.push(node as HTMLScriptElement);

			return node;
		});
	});

	afterEach(() => {
		document.head.innerHTML = "";
	});

	it("initialises in place when the vendor script has already loaded", () => {
		renderTabs(true);
		const initInlineWidgets = bookingWidget();

		visit(`?${TAB_QUERY_KEY}=appointment`);
		initTabs();

		expect(initInlineWidgets).toHaveBeenCalledOnce();
		expect(injectedScripts()).toHaveLength(0);
	});

	it("loads the vendor script once, and only when the tab is actually asked for", () => {
		renderTabs(true);

		initTabs();
		expect(injectedScripts()).toHaveLength(0);

		tab("appointment").click();

		const [script] = injectedScripts();
		expect(script.async).toBe(true);
		expect(script.defer).toBe(true);
	});

	it("marks the widget so a second visit to the tab does not ask again", () => {
		renderTabs(true);

		visit(`?${TAB_QUERY_KEY}=appointment`);
		initTabs();

		expect(widget().dataset.calendlyInitialized).toBe("true");

		tab("email").click();
		tab("appointment").click();

		expect(injectedScripts()).toHaveLength(1);
	});

	it("does not inject a second copy when one is already on the page", () => {
		renderTabs(true);
		alreadyOnThePage();

		visit(`?${TAB_QUERY_KEY}=appointment`);
		initTabs();

		expect(injectedScripts()).toHaveLength(0);
	});

	it("loads the vendor script rather than throwing when the Calendly global is not the vendor's", () => {
		renderTabs(true);
		Object.assign(window, { Calendly: { initInlineWidgets: "not a function" } });

		visit(`?${TAB_QUERY_KEY}=appointment`);
		expect(() => initTabs()).not.toThrow();
		expect(injectedScripts()).toHaveLength(1);
	});

	it("asks for nothing on a page that carries no widget", () => {
		renderTabs();

		visit(`?${TAB_QUERY_KEY}=appointment`);
		initTabs();

		expect(injectedScripts()).toHaveLength(0);
	});
});

describe("keyboard navigation", () => {
	it("moves to the next tab with ArrowRight, wrapping past the last", () => {
		initTabs();

		press({ target: "email", key: "ArrowRight" });
		expect(paintedTab()).toBe("appointment");

		press({ target: "appointment", key: "ArrowRight" });
		expect(paintedTab()).toBe("email");
	});

	it("moves to the previous tab with ArrowLeft, wrapping past the first", () => {
		initTabs();

		press({ target: "email", key: "ArrowLeft" });

		expect(paintedTab()).toBe("appointment");
	});

	it("jumps to the last tab with End and back with Home", () => {
		initTabs();

		press({ target: "email", key: "End" });
		expect(paintedTab()).toBe("appointment");

		press({ target: "appointment", key: "Home" });
		expect(paintedTab()).toBe("email");
	});

	it("stays where it is for a key that means nothing here", () => {
		initTabs();

		press({ target: "email", key: "ArrowDown" });

		expect(paintedTab()).toBe("email");
	});

	it("keeps one tab in the tab order and takes the others out", () => {
		initTabs();

		expect(tabButton("email").tabIndex).toBe(0);
		expect(tabButton("appointment").tabIndex).toBe(-1);

		press({ target: "email", key: "ArrowRight" });

		expect(tabButton("appointment").tabIndex).toBe(0);
		expect(tabButton("email").tabIndex).toBe(-1);
	});

	it("takes focus with it, so the reader lands on the tab it selected", () => {
		initTabs();

		press({ target: "email", key: "ArrowRight" });

		expect(document.activeElement).toBe(tabButton("appointment"));
	});
});
