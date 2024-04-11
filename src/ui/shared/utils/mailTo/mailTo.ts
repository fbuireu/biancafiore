import { CONTACT_DETAILS } from 'src/consts.ts';

export function mailTo() {
    const selector = document.querySelector('.mailTo__button');
    if (!selector) return;

    selector.addEventListener('click', () => {
        const email = atob(CONTACT_DETAILS.ENCODED_BIANCA_EMAIL);
        window.location.href = `mailto:${email}`;
    });
}
