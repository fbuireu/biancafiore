import { createRoot } from 'react-dom/client';
import { Pin as pin } from '@assets/images/svg-components/pin';

interface RenderPinParams {
    markerData: Object;
}

export function renderPin({ markerData }: RenderPinParams): HTMLElement {
    const markerWrapper = document.createElement('div');
    markerWrapper.classList.add('marker__wrapper');
    const marker = document.createElement('div');
    const root = createRoot(marker);
    root.render(pin());
    markerWrapper.appendChild(marker);
    markerWrapper.onclick = () => console.info(markerData);

    return markerWrapper;
}
