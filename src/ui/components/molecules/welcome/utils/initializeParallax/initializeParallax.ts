import { gsap } from 'gsap';
import type { MouseEvent } from 'react';

interface ParallaxParams {
  event: globalThis.MouseEvent | MouseEvent;
  target: string;
  movement: number;
}

export function initializeParallax() {
  const WELCOME = document.querySelector('.welcome') as HTMLElement;

  if (WELCOME instanceof HTMLElement) {
    WELCOME.addEventListener('mousemove', (event) => {
      attachParallax({ event, target: '.welcome__image', movement: -30 });
    });
  }
  function attachParallax({ event, target, movement }: ParallaxParams) {
    if (WELCOME instanceof HTMLElement) {
      const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = WELCOME;
      const relativeX = event.pageX - offsetLeft;
      const relativeY = event.pageY - offsetTop;

      gsap.to(target, {
        duration: 1,
        x: ((relativeX - offsetWidth / 2) / offsetWidth) * movement,
        y: ((relativeY - offsetHeight / 2) / offsetHeight) * movement,
      });
    }
  }
}
