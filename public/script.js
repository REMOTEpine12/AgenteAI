document.addEventListener('DOMContentLoaded', function () {
    var tabButtons = Array.from(document.querySelectorAll('.tab-button'));
    var tabContents = Array.from(document.querySelectorAll('.tab-content'));

    function activateTab(tabName) {
        tabButtons.forEach(function (btn) {
            var isActive = btn.dataset.tab === tabName;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', String(isActive));
        });

        tabContents.forEach(function (section) {
            var isActive = section.id === tabName + "-tab";
            section.classList.toggle('active', isActive);
            section.setAttribute('aria-hidden', String(!isActive));
        });

        var url = new URL(window.location.href);
        url.hash = "tab=" + tabName;
        history.replaceState(null, '', url.toString());
    }

    tabButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var tab = btn.dataset.tab;
            if (tab) activateTab(tab);
        });
    });

    var hash = window.location.hash.replace(/^#/, '');
    var params = new URLSearchParams(hash);
    var initialTab = params.get('tab');
    if (initialTab) {
        activateTab(initialTab);
    }
});

 