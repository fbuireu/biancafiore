import type { KeyboardEvent } from 'react';

export function autosize(event: KeyboardEvent<HTMLTextAreaElement>): void {
    const { currentTarget } = event;

    setTimeout(() => {
        currentTarget.style.cssText = `height:auto; padding:0`;
        currentTarget.style.cssText = `height:${currentTarget.scrollHeight}px`;
    }, 0);
}
