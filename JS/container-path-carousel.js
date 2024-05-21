// JS/carousel.js

document.addEventListener('DOMContentLoaded', function () {
    const containerPath = document.querySelector('.container-path');
    const paths = document.querySelectorAll('.path');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentIndex = 0;

    function updateCarousel() {
        containerPath.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    prevBtn.addEventListener('click', function () {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', function () {
        if (currentIndex < paths.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Initial update to position the first element
    updateCarousel();
});
