import { filterPaths } from './explorePaths.js';

document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('filter-form');

    filterForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(filterForm);
        const params = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
            if (value) {
                params.append(key, value);
            }
        }

        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
        filterPaths(); // Call the filter function directly
    });

    applyFiltersFromURL();
});

function applyFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const grade = urlParams.get('grade');

    const filterForm = document.getElementById('filter-form');

    if (type) {
        filterForm.elements['type'].value = type;
    }
    if (grade) {
        filterForm.elements['grade'].value = grade;
    }

    filterPaths(); // Call the filter function to apply filters on page load
}
