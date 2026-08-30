import { CALENDLY, CALENDLY_WIDGET_SCRIPT } from "@const/calendly";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { activeTab, initTabs, TAB_QUERY_KEY } from "./tabs";

const CONTACT_PATH = "/contact";
const ACTIVE_TAB_CLASS = "contact-tab--active";
const ACTIVE_CONTENT_CLASS = "contact-tab__content--active";

const renderTabs = ({ booking = false }: { booking?: boolean } = {}): void => {
	document.body.innerHTML = `
		<ul>
			<li class="contact-tab" data-target="email"><button type="button">Email me</button></li>
			<li class="contact-tab" data-target="appointment"><button type="button">Make an appointment</button></li>
		</ul>
		<div id="email" class="contact-tab__content ${ACTIVE_CONTENT_CLASS}"></div>
		<div id="appointment" class="contact-tab__content">
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
	const element = document.querySelector<HTMLElement>(`.contact-tab[data-target="${target}"]`);

	if (!element) {
		throw new Error(`no tab for ${target}`);
	}

	return element;
};

const paintedTab = (): string | undefined =>
	document.querySelector<HTMLElement>(`.${ACTIVE_CONTENT_CLASS}`)?.id ??
	document.querySelector<HTMLElement>(`.${ACTIVE_TAB_CLASS}`)?.dataset.target;

const contactUrl = (search = ""): URL => new URL(`${CONTACT_PATH}${search}`, window.location.href);

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
	Reflect.deleteProperty(window, "Calendly");
	document.body.innerHTML = "";
});

describe("initTabs", () => {
	it("restores the tab a link asked for without adding a history entry", () => {
		const { push, replace } = watchHistory();

		initTabs(contactUrl(`?${TAB_QUERY_KEY}=appointment`));

		expect(paintedTab()).toBe("appointment");
		expect(push).not.toHaveBeenCalled();
		expect(replace).not.toHaveBeenCalled();
	});

	it("shows the first tab when the URL asks for none, and still writes nothing", () => {
		const { push, replace } = watchHistory();

		initTabs(contactUrl());

		expect(paintedTab()).toBe("email");
		expect(push).not.toHaveBeenCalled();
		expect(replace).not.toHaveBeenCalled();
	});

	it("falls back to the first tab when the URL asks for one that does not exist", () => {
		const { push, replace } = watchHistory();

		initTabs(contactUrl(`?${TAB_QUERY_KEY}=carrier-pigeon`));

		expect(paintedTab()).toBe("email");
		expect(push).not.toHaveBeenCalled();
		expect(replace).not.toHaveBeenCalled();
	});

	it("reads the query string of the page when it is given no URL", () => {
		history.replaceState({ index: 0 }, "", `${CONTACT_PATH}?${TAB_QUERY_KEY}=appointment`);

		initTabs();

		expect(paintedTab()).toBe("appointment");
	});

	it("does nothing on a page that carries no tabs", () => {
		document.body.innerHTML = "";
		const { push, replace } = watchHistory();

		expect(() => initTabs(contactUrl())).not.toThrow();
		expect(push).not.toHaveBeenCalled();
		expect(replace).not.toHaveBeenCalled();
	});
});

describe("choosing a tab", () => {
	it("replaces the current entry rather than pushing a new one, so Back still leaves the page", () => {
		const { push, replace } = watchHistory();

		initTabs(contactUrl());
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

		initTabs(contactUrl());
		tab("appointment").click();

		expect(replace.mock.calls[0]?.[0]).toEqual(state);
	});

	it("publishes the tab under the key it reads back, so a shared URL restores it", () => {
		initTabs(contactUrl());
		tab("appointment").click();

		const shared = new URL(window.location.href);

		renderTabs();
		initTabs(shared);

		expect(paintedTab()).toBe("appointment");
	});

	it("keeps the rest of the query string and the fragment", () => {
		history.replaceState({ index: 0 }, "", `${CONTACT_PATH}?utm_source=newsletter#form`);

		const { replace } = watchHistory();

		initTabs(contactUrl());
		tab("appointment").click();

		expect(replace).toHaveBeenCalledWith(
			expect.anything(),
			"",
			`${CONTACT_PATH}?utm_source=newsletter&${TAB_QUERY_KEY}=appointment#form`,
		);
	});

	it("boots the booking widget the appointment tab needs, once", () => {
		renderTabs({ booking: true });

		const initInlineWidgets = bookingWidget();

		initTabs(contactUrl());
		tab("appointment").click();
		tab("email").click();
		tab("appointment").click();

		expect(initInlineWidgets).toHaveBeenCalledTimes(1);
	});

	it("wires a tab once, however often the page is initialised", () => {
		initTabs(contactUrl());
		initTabs(contactUrl());

		const { replace } = watchHistory();

		tab("appointment").click();

		expect(replace).toHaveBeenCalledTimes(1);
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
		renderTabs({ booking: true });
		const initInlineWidgets = bookingWidget();

		initTabs(contactUrl(`?${TAB_QUERY_KEY}=appointment`));

		expect(initInlineWidgets).toHaveBeenCalledOnce();
		expect(injectedScripts()).toHaveLength(0);
	});

	it("loads the vendor script once, and only when the tab is actually asked for", () => {
		renderTabs({ booking: true });

		initTabs(contactUrl());
		expect(injectedScripts()).toHaveLength(0);

		tab("appointment").click();

		const [script] = injectedScripts();
		expect(script.async).toBe(true);
		expect(script.defer).toBe(true);
	});

	it("marks the widget so a second visit to the tab does not ask again", () => {
		renderTabs({ booking: true });

		initTabs(contactUrl(`?${TAB_QUERY_KEY}=appointment`));

		expect(widget().dataset.calendlyInitialized).toBe("true");

		tab("email").click();
		tab("appointment").click();

		expect(injectedScripts()).toHaveLength(1);
	});

	it("does not inject a second copy when one is already on the page", () => {
		renderTabs({ booking: true });
		alreadyOnThePage();

		initTabs(contactUrl(`?${TAB_QUERY_KEY}=appointment`));

		expect(injectedScripts()).toHaveLength(0);
	});

	it("asks for nothing on a page that carries no widget", () => {
		renderTabs();

		initTabs(contactUrl(`?${TAB_QUERY_KEY}=appointment`));

		expect(injectedScripts()).toHaveLength(0);
	});
});
