const SELECTORS = {
	TABLE_OF_CONTENTS: ".article__table-of-contents__nav",
};

const ANIMATION_NAME = "fade-in";

export function observeOpacity(): void {
	const TABLE_OF_CONTENTS = document.querySelector(SELECTORS.TABLE_OF_CONTENTS);

	if (!TABLE_OF_CONTENTS) return;

	TABLE_OF_CONTENTS.addEventListener("animationend", (event) => {
		const animationEvent = event as AnimationEvent;

		if (animationEvent.animationName === ANIMATION_NAME) {
			const isVisible = window.getComputedStyle(TABLE_OF_CONTENTS).opacity === "1";
			TABLE_OF_CONTENTS.classList.toggle("--is-visible", isVisible);
		}
	});
}
