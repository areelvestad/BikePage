import { listPaths } from './listPaths.js';
import { preprocessGeoJSON, geojsonData } from './preprocess-geojson.js';
import { createClimbGraph } from './climbGraph.js';

var exploreMap = L.map('explore-map', {
    zoom: 8,
    center: [69.6500, 21.2900],
    zoomAnimation: true
});
L.tileLayer('https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png', {
    attribution: 'Kartverket',
    fullscreenControl: true
}).addTo(exploreMap);

const pathTextbox = document.getElementById('path-textbox');
const pathNoTextbox = document.getElementById('path-notextbox');

const customMarkerIcon = L.divIcon({
    html: `<span class="material-symbols-outlined">directions_bike</span>`,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const parkingMarkerIcon = L.divIcon({
    html: `<span class="material-symbols-outlined">local_parking</span>`,
    className: 'custom-parking-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

let geojsonLayers = []; // Array to keep track of geojson layers
let parkingMarker = null; // Variable to keep track of the parking marker

function loadGeoJson(paths) {
    let allLatlngs = [];
    let promises = [];

    paths.forEach(path => {
        let promise = fetch(path.geojson)
            .then(response => response.json())
            .then(geojson => {
                const defaultStyle = {
                    color: 'red',
                    weight: 3,
                    opacity: 0.7,
                    dashArray: '1, 4'
                };

                const hoverStyle = {
                    color: 'green',
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
                });

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

                const firstCoord = geojson.features[0].geometry.coordinates[0];
                let coords = firstCoord;
                if (Array.isArray(coords[0])) {
                    coords = coords[0];
                }
                const [lng, lat] = coords;
                const latlng = new L.LatLng(lat, lng);
                const marker = L.marker(latlng, { icon: customMarkerIcon });

                marker.on('click', function() {
                    displayPathInfo(path);
                });

                marker.on('mouseover', function() {
                    geojsonLayer.setStyle(hoverStyle);
                });

                marker.on('mouseout', function() {
                    geojsonLayer.setStyle(defaultStyle);
                });

                geojsonLayer.addTo(exploreMap);
                marker.addTo(exploreMap);

                geojsonLayers.push(geojsonLayer); // Keep track of the layer
                geojsonLayers.push(marker); // Keep track of the marker
            })
            .catch(error => console.error(`Error loading GeoJSON for ${path.route}:`, error));

        promises.push(promise);
    });

    Promise.all(promises).then(() => {
        if (allLatlngs.length > 0) {
            const bounds = L.latLngBounds(allLatlngs);
            exploreMap.flyToBounds(bounds, { padding: [50, 50] });
        }
    });
}

function displayPathInfo(path) {
    pathNoTextbox.classList.add('hidden');
    pathNoTextbox.classList.remove('show');
    pathTextbox.classList.add('show');
    pathTextbox.classList.remove('hidden');

    pathTextbox.innerHTML = `
        <img src='./IMG/${path.name}/01/${path.name}_350.jpg'>
        <div class="textbox">
            <h2>${path.name}, ${path.area}</h2>
            <p>${path.description}</p>
            <div class="path-grade">
                <div class="path-grade-type"><b>Type:</b> ${path.type}</div>
                <div class="path-grade-item"><b>Grad:</b> <span class="grade-${path.grade}">${path.grade}</span></div>
            </div>
        </div>
        <a href="./trail.html?municipality=${path.municipality}&route=${path.route}">Utforsk</a>
    `;

    // Add or update the parking marker
    if (parkingMarker) {
        exploreMap.removeLayer(parkingMarker);
    }
    if (path.parking) {
        const [lat, lng] = path.parking.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
            parkingMarker = L.marker([lat, lng], { icon: parkingMarkerIcon }).addTo(exploreMap);
        }
    }
}

export function filterPaths() {
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

    // Remove only the GeoJSON layers
    geojsonLayers.forEach(layer => {
        exploreMap.removeLayer(layer);
    });
    geojsonLayers = []; // Clear the array

    loadGeoJson(filteredPaths);
}

document.addEventListener('DOMContentLoaded', function() {
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
