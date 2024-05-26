function createHtmlPaths(listPath) {
    return `
    <style>
    #map${listPath.route} {
        flex: 1;
        width: 100%;
        height: 100%;
        max-height: 100vh;
        border-radius: .5em;
    }
    
    .leaflet-control-zoom {
        display: none;
    }
    
    .path-maps {
        position: absolute; /* Position should be absolute if you want it to expand within its parent */
        right: 5px;
        top: 8px;
        width: 100px;
        height: 50px;
        transition: width 0.2s ease-in-out, height 0.2s ease-in-out;
        z-index: 999; /* Ensure it is on top of other elements */
    }
    
    .path-maps:hover {
        width: 290px;
        height: 97%; 
        filter: drop-shadow(0 0 1em darkgreen);
    }
    
    .leaflet-control-fullscreen {
        position: absolute;
        top: 10px; /* Adjust as needed */
        right: 10px; /* Adjust as needed */
        left: auto;  /* Override left positioning */
    }
    </style>

    <div class="container-path ${listPath.name}${listPath.route}">
    <div class="path-title">
            ${listPath.route}
            <div class="path-lead">
                ${listPath.name}, ${listPath.municipality}
            </div>
        </div>
        <img src="IMG/${listPath.name}.jpg" alt="" class="path-image">
        <div  class="path-maps">
            <div id="map${listPath.route}"></div>
        </div>
        <div class="path-info">
            <div class="path-description">
                ${listPath.description}
            </div>
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

const containerPaths = document.getElementById('container-paths');
listPaths.forEach(listPath => {
    containerPaths.innerHTML += createHtmlPaths(listPath);
});

document.addEventListener('DOMContentLoaded', function() {
    listPaths.forEach(listPath => {
        var map = L.map(`map${listPath.route}`, {
            center: [listPath.midpoint.split(',')[0], listPath.midpoint.split(',')[1]],
            zoom: listPath.mapZoom,
            zoomControl: false,
            attributionControl: false,
            fullscreenControl: true
        });

        L.tileLayer('https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}', {
            attribution: ''
        }).addTo(map);

        if (listPath.geojson) {
            fetch(listPath.geojson)
                .then(response => response.json())
                .then(data => {
                    L.geoJSON(data, {
                        style: function (feature) {
                            return {
                                color: 'blue',
                                weight: 5,
                                opacity: 0.7,
                                dashArray: '5, 5'
                            };
                        }
                    }).addTo(map);
                })
                .catch(error => console.error('Error loading GeoJSON:', error));
        }

        const mapContainer = document.getElementById(`map${listPath.route}`);
        mapContainer.addEventListener('mouseenter', function() {
            const startLocation = listPath.startLocation.split(',').map(Number);
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