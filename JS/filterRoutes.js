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

        window.location.search = params.toString();
    });

    applyFiltersFromURL();
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
}
