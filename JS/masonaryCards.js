document.addEventListener('DOMContentLoaded', function() {
    const containerPaths = document.querySelector('.container-paths');
    imagesLoaded(containerPaths, function() {
        new Masonry(containerPaths, {
            itemSelector: '.masonry-item',
            columnWidth: 300,
            gutter: 15,
            fitWidth: true
        });
    });
});
