import { gsap } from "gsap";

export const flyPlane = (button: HTMLButtonElement) => {
	if (!button.classList.contains("--is-active")) {
		button.classList.add("--is-active");

		const getPropertyValue = (variable: string) => window.getComputedStyle(button).getPropertyValue(variable);

		gsap.timeline().to(button, {
			keyframes: [
				{
					"--left-wing-first-x": 50,
					"--left-wing-first-y": 100,
					"--right-wing-second-x": 50,
					"--right-wing-second-y": 100,
					duration: 0.5,
					onComplete: () => {
						gsap.set(button, {
							"--left-wing-first-y": 0,
							"--left-wing-second-x": 40,
							"--left-wing-second-y": 100,
							"--left-wing-third-x": 0,
							"--left-wing-third-y": 100,
							"--left-body-third-x": 40,
							"--right-wing-first-x": 50,
							"--right-wing-first-y": 0,
							"--right-wing-second-x": 60,
							"--right-wing-second-y": 100,
							"--right-wing-third-x": 100,
							"--right-wing-third-y": 100,
							"--right-body-third-x": 60,
						});
					},
				},
				{
					"--left-wing-third-x": 20,
					"--left-wing-third-y": 90,
					"--left-wing-second-y": 90,
					"--left-body-third-y": 90,
					"--right-wing-third-x": 80,
					"--right-wing-third-y": 90,
					"--right-body-third-y": 90,
					"--right-wing-second-y": 90,
					duration: 0.2,
				},
				{
					"--rotate": 50,
					"--left-wing-third-y": 95,
					"--left-wing-third-x": 27,
					"--right-body-third-x": 45,
					"--right-wing-second-x": 45,
					"--right-wing-third-x": 60,
					"--right-wing-third-y": 83,
					duration: 0.25,
				},
				{
					"--rotate": 55,
					"--plane-x": -8,
					"--plane-y": 24,
					duration: 0.2,
				},
				{
					"--rotate": 40,
					"--plane-x": 45,
					"--plane-y": -180,
					"--plane-opacity": 0,
					duration: 0.3,
				},
			],
		});

		gsap.to(button, {
			keyframes: [
				{
					"--text-opacity": 0,
					"--left-wing-background": getPropertyValue("--primary-dark-2"),
					"--right-wing-background": getPropertyValue("--primary-dark-2"),
					duration: 0.2,
				},
				{
					"--left-wing-background": getPropertyValue("--neutral-main"),
					"--right-wing-background": getPropertyValue("--neutral-main"),
					duration: 0.1,
				},
				{
					"--left-body-background": getPropertyValue("--primary-dark-1"),
					"--right-body-background": getPropertyValue("--primary-dark-2"),
					duration: 0.4,
				},
			],
		});
	}
};
