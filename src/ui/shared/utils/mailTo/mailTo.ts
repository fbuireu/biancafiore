import { ENCODED_BIANCA_EMAIL } from 'src/consts.ts';

export function mailTo() {
    const selector = document.querySelector('.mailTo__button');
    if (!selector) return;

    selector.addEventListener('click', () => {
        const email = atob(ENCODED_BIANCA_EMAIL);
        window.location.href = `mailto:${email}`;
    });
}
