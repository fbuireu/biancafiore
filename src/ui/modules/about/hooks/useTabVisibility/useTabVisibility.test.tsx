import { useTabVisibility } from "@modules/about/hooks/useTabVisibility/useTabVisibility";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const Reader = () => <output>{useTabVisibility()}</output>;

const setVisibility = (state: DocumentVisibilityState) => {
	vi.spyOn(document, "visibilityState", "get").mockReturnValue(state);
};

const switchTab = () =>
	act(() => {
		document.dispatchEvent(new Event("visibilitychange"));
	});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("useTabVisibility", () => {
	it("reports the state the document is already in", () => {
		setVisibility("visible");

		render(<Reader />);

		expect(screen.getByRole("status").textContent).toBe("visible");
	});

	it("re-reports when the reader leaves the tab and comes back", () => {
		setVisibility("visible");
		render(<Reader />);

		setVisibility("hidden");
		switchTab();
		expect(screen.getByRole("status").textContent).toBe("hidden");

		setVisibility("visible");
		switchTab();
		expect(screen.getByRole("status").textContent).toBe("visible");
	});

	it("stops listening once the component using it goes away, so a hidden globe is not woken", () => {
		const removeEventListener = vi.spyOn(document, "removeEventListener");
		setVisibility("visible");

		const { unmount } = render(<Reader />);
		unmount();

		expect(removeEventListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
	});
});
