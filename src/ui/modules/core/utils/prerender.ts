export function onceActivated(start: () => void): void {
	if (document.prerendering) {
		document.addEventListener("prerenderingchange", start, { once: true });

		return;
	}

	start();
}
