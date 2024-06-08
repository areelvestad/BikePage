function createHtmlPaths(listPath) {
    return `
    <style>
        #map${listPath.route} {
            flex: 1;
            width: 100%;
            height: 100%;
            max-height: 100vh;
        }
    </style>

    <div class="container-path ${listPath.name}${listPath.route} masonry-item">
        <div class="path-title">
            <h2>${listPath.route}</h2>
            <h3>${listPath.area}, ${listPath.municipality}</h3>
        </div>
        <div class="path-image" style="background-image: url('IMG/${listPath.name}.jpg');"></div>
        <div class="path-maps"><div id="map${listPath.route}"></div></div>

        <div class="path-info">
            <div class="path-description">${listPath.description}</div>
            <div class="path-grade">
                <div class="path-grade-length"><b>Length:</b> ${listPath.length}</div>
                <div class="path-grade-climb"><b>Climb:</b> ${listPath.climb}</div>
                <div class="path-grade-type"><b>Type:</b> ${listPath.type}</div>
                <div class="path-grade-grade ${listPath.grade}"><b>Grade:</b> ${listPath.grade}</div>
            </div>
        </div>
    </div>
    `;
}

document.addEventListener('DOMContentLoaded', function() {
    const containerPaths = document.getElementById('container-paths');
    listPaths.forEach(listPath => {
        containerPaths.innerHTML += createHtmlPaths(listPath);
    });

    // Initialize Masonry with a delay to ensure all elements are loaded
    imagesLoaded(containerPaths, function() {
        setTimeout(function() {
            masonryInstance = new Masonry(containerPaths, {
                itemSelector: '.masonry-item',
                columnWidth: 300,
                gutter: 15,
                fitWidth: true
            });
        }, 1000); // Delay in milliseconds (1000ms = 1 second)
    });

    listPaths.forEach(listPath => {
        var map = L.map(`map${listPath.route}`, {
            center: [listPath.midpoint.split(',')[0], listPath.midpoint.split(',')[1]],
            zoom: listPath.mapZoom,
            zoomControl: false,
            attributionControl: false,
            fullscreenControl: true
        });

        L.tileLayer('https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=toporaster4&zoom={z}&x={x}&y={y}', {
            attribution: 'Kartverket'
        }).addTo(map);

        if (listPath.geojson) {
            fetch(listPath.geojson)
                .then(response => response.json())
                .then(data => {
                    L.geoJSON(data, {
                        style: function (feature) {
                            return {
                                color: 'red',
                                weight: 3,
                                opacity: 0.7,
                                dashArray: '1, 4'
                            };
                        }
                    }).addTo(map);
                })
                .catch(error => console.error('Error loading GeoJSON:', error));
        }

        const mapContainer = document.getElementById(`map${listPath.route}`);
        mapContainer.addEventListener('mouseenter', function() {
            const startLocation = listPath.zoomLocation.split(',').map(Number);
            map.setView(startLocation, listPath.mapZoomStart);
            setTimeout(function() {
                map.invalidateSize();
            }, 200); // Adjust the timeout as needed
        });

        mapContainer.addEventListener('mouseleave', function() {
            setTimeout(function() {
                const midpoint = listPath.midpoint.split(',').map(Number);
                map.setView(midpoint, listPath.mapZoom);
                setTimeout(function() {
                    map.invalidateSize();
                }, 200); // Adjust the timeout as needed
            }, 200); // Adjust the timeout as needed
        });
    });
});

// Function to update the Masonry layout
function updateMasonryLayout() {
    if (masonryInstance) {
        masonryInstance.layout();
    }
}

