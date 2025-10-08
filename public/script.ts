document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.tab-button'));
    const tabContents = Array.from(document.querySelectorAll<HTMLElement>('.tab-content'));

    function activateTab(tabName: string) {
        // Actualiza botones
        tabButtons.forEach((btn) => {
            const isActive = btn.dataset.tab === tabName;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', String(isActive));
        });

        // Muestra/oculta contenidos
        tabContents.forEach((section) => {
            const isActive = section.id === `${tabName}-tab`;
            section.classList.toggle('active', isActive);
            section.setAttribute('aria-hidden', String(!isActive));
        });

        // Actualiza hash (sin causar scroll)
        const url = new URL(window.location.href);
        url.hash = `tab=${tabName}`;
        history.replaceState(null, '', url.toString());
    }

    // Listener de clicks
    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (tab) activateTab(tab);
        });
    });

    // Tab inicial desde hash si existe (#tab=demo_agente)
    const hash = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash);
    const initialTab = params.get('tab');
    if (initialTab) {
        activateTab(initialTab);
    }
});

 