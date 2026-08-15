import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initTabs, TAB_QUERY_KEY } from "./tabs";

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
			${booking ? '<div class="calendly-inline-widget"></div>' : ""}
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

const activeTab = (): string | undefined =>
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

		expect(activeTab()).toBe("appointment");
		expect(push).not.toHaveBeenCalled();
		expect(replace).not.toHaveBeenCalled();
	});

	it("shows the first tab when the URL asks for none, and still writes nothing", () => {
		const { push, replace } = watchHistory();

		initTabs(contactUrl());

		expect(activeTab()).toBe("email");
		expect(push).not.toHaveBeenCalled();
		expect(replace).not.toHaveBeenCalled();
	});

	it("falls back to the first tab when the URL asks for one that does not exist", () => {
		const { push, replace } = watchHistory();

		initTabs(contactUrl(`?${TAB_QUERY_KEY}=carrier-pigeon`));

		expect(activeTab()).toBe("email");
		expect(push).not.toHaveBeenCalled();
		expect(replace).not.toHaveBeenCalled();
	});

	it("reads the query string of the page when it is given no URL", () => {
		history.replaceState({ index: 0 }, "", `${CONTACT_PATH}?${TAB_QUERY_KEY}=appointment`);

		initTabs();

		expect(activeTab()).toBe("appointment");
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

		expect(activeTab()).toBe("appointment");
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

		expect(activeTab()).toBe("appointment");
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
