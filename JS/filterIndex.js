import { filterPaths } from './cardPaths.js';

document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('filter-form');

    filterForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        const formData = new FormData(filterForm);
        const params = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
            if (value) {
                params.append(key, value);
            }
        }

        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
        updateContainerPaths(); // Update only the container paths
    });

    // Apply filters from URL on page load
    applyFiltersFromURL();
    // Listen for popstate event to handle browser back/forward buttons
    window.addEventListener('popstate', applyFiltersFromURL);
});

function applyFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const municipality = urlParams.get('municipality');
    const type = urlParams.get('type');
    const grade = urlParams.get('grade');

    const filterForm = document.getElementById('filter-form');

    if (municipality) {
        filterForm.elements['municipality'].value = municipality;
    }
    if (type) {
        filterForm.elements['type'].value = type;
    }
    if (grade) {
        filterForm.elements['grade'].value = grade;
    }

    updateContainerPaths(); // Update only the container paths
}

function updateContainerPaths() {
    filterPaths(); // Call the filter function to update the container paths
}
