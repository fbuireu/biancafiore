interface Tab {
    id: string;
    target: string;
}

// Función para cambiar de pestaña
function changeTab(tabId: Tab['id']): void {
    document.querySelectorAll('.tab-content').forEach((tabContent) => {
        (tabContent as HTMLElement).style.display = 'none';
    });
    (document.getElementById(tabId) as HTMLElement).style.display = 'block';

    document.querySelectorAll('.tab').forEach((tab) => {
        if (tab.id === tabId) tab.classList.add('active');
        else tab.classList.remove('active');
    });
}

export function initTabs(): void {
    document.querySelectorAll('.tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            changeTab((tab as HTMLElement).dataset.target || '');
        });
    });
    changeTab((document.querySelector('.tab') as HTMLElement).dataset.target || '');
}
