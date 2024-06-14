function loadHTML(selector, url) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.querySelector(selector).innerHTML = data;
        })
        .catch(error => console.error('Error loading HTML:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    loadHTML('.container-nav', 'nav.html');
    loadHTML('.container-footer', 'footer.html');
});
