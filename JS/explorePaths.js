import { listPaths } from './listPaths.js';

var exploreMap = L.map('explore-map').setView([69.6500, 21.2900], 8);
L.tileLayer('https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}', {
    attribution: 'Kartverket'
}).addTo(exploreMap);

const pathTextbox = document.getElementById('path-textbox');
const pathNoTextbox = document.getElementById('path-notextbox');

const customMarkerIcon = L.divIcon({
    html: `
    <span class="material-symbols-outlined">directions_bike</span>
    `,
    className: 'custom-marker', 
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

function loadGeoJson(paths) {
    let allLatlngs = [];

    paths.forEach(path => {
        fetch(path.geojson)
            .then(response => response.json())
            .then(geojson => {
                const defaultStyle = {
                    color: 'blue',
                    weight: 3,
                    opacity: 0.7,
                    dashArray: '1, 4'
                };

                const hoverStyle = {
                    color: 'darkred',
                    weight: 3,
                    opacity: 1,
                    dashArray: '1, 4'
                };

                const geojsonLayer = L.geoJSON(geojson, {
                    style: defaultStyle,
                    onEachFeature: function(feature, layer) {
                        layer.on('click', function() {
                            displayPathInfo(path);
                        });
                        layer.on('mouseover', function() {
                            layer.setStyle(hoverStyle);
                        });
                        layer.on('mouseout', function() {
                            layer.setStyle(defaultStyle);
                        });
                    }
                }).addTo(exploreMap);

                // Collect all latlngs from the geojson to calculate bounds
                geojsonLayer.eachLayer(layer => {
                    if (layer.getLatLngs) {
                        layer.getLatLngs().forEach(latlng => {
                            if (Array.isArray(latlng)) {
                                latlng.forEach(coord => allLatlngs.push(coord));
                            } else {
                                allLatlngs.push(latlng);
                            }
                        });
                    }
                });

                // Add a custom SVG marker at the first coordinate of the path
                const firstCoord = geojson.features[0].geometry.coordinates[0];
                let coords = firstCoord;
                if (Array.isArray(coords[0])) {
                    coords = coords[0]; // Get the first set of coordinates
                }
                const [lng, lat] = coords;
                const latlng = new L.LatLng(lat, lng);
                const marker = L.marker(latlng, { icon: customMarkerIcon }).addTo(exploreMap);

                marker.on('click', function() {
                    displayPathInfo(path);
                });

                marker.on('mouseover', function() {
                    geojsonLayer.setStyle(hoverStyle);
                });

                marker.on('mouseout', function() {
                    geojsonLayer.setStyle(defaultStyle);
                });

                // Update the map view to fit bounds with padding
                if (allLatlngs.length > 0) {
                    const bounds = L.latLngBounds(allLatlngs);
                    exploreMap.fitBounds(bounds, { padding: [50, 50] }); // Adjust padding as needed
                }
            })
            .catch(error => console.error(`Error loading GeoJSON for ${path.route}:`, error));
    });
}

function displayPathInfo(path) {
    pathNoTextbox.classList.add('hidden');
    pathNoTextbox.classList.remove('show');
    pathTextbox.classList.add('show');
    pathTextbox.classList.remove('hidden');

    pathTextbox.innerHTML = `
        <img src='./IMG/${path.name}/01/${path.name}_300.jpg'>
        <div class="textbox">
            <h2>${path.name}, ${path.area}</h2>
            <p>${path.description}</p>
        </div>
        <a href="./trail.html?municipality=${path.municipality}&route=${path.route}">Explore</a>
    `;
}

function filterPaths() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const grade = urlParams.get('grade');

    let filteredPaths = listPaths;

    if (type) {
        filteredPaths = filteredPaths.filter(path => path.type.toLowerCase().includes(type.toLowerCase()));
    }
    if (grade) {
        filteredPaths = filteredPaths.filter(path => path.grade.toLowerCase().includes(grade.toLowerCase()));
    }

    exploreMap.eachLayer(layer => {
        if (layer instanceof L.GeoJSON || layer instanceof L.Marker) {
            exploreMap.removeLayer(layer);
        }
    });

    loadGeoJson(filteredPaths);
}

filterPaths();

document.getElementById('filter-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
        if (value) {
            params.append(key, value);
        }
    }

    window.location.search = params.toString();
    filterPaths();
});
