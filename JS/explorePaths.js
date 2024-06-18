import { listPaths } from './listPaths.js';

var exploreMap = L.map('explore-map').setView([69.6500, 21.2900], 8);
L.tileLayer('https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}', {
    attribution: 'Kartverket'
}).addTo(exploreMap);

const pathTextbox = document.getElementById('path-textbox');
const pathNoTextbox = document.getElementById('path-notextbox');

function loadGeoJson(paths) {
    paths.forEach(path => {
        fetch(path.geojson)
            .then(response => response.json())
            .then(geojson => {
                const geojsonLayer = L.geoJSON(geojson, {
                    style: function(feature) {
                        return {
                            color: 'blue',
                            weight: 3,
                            opacity: 0.7,
                            dashArray: '1, 4'
                        };
                    },
                    onEachFeature: function(feature, layer) {
                        layer.on('click', function() {
                            displayPathInfo(path);
                        });
                    }
                }).addTo(exploreMap);

                // Add a pin at the first coordinate of the path
                const firstCoord = geojson.features[0].geometry.coordinates[0];
                // Handle nested coordinates if it's a LineString or MultiLineString
                let coords = firstCoord;
                if (Array.isArray(coords[0])) {
                    coords = coords[0];  // Get the first set of coordinates
                }
                const [lng, lat] = coords;
                const latlng = new L.LatLng(lat, lng);
                const marker = L.marker(latlng).addTo(exploreMap);

                // Add a click event to open the popup on the marker and show the info in the path-textbox
                marker.on('click', function() {
                    displayPathInfo(path);
                });
            })
            .catch(error => console.error(`Error loading GeoJSON for ${path.route}:`, error)); 
    });
}

function displayPathInfo(path) {
    // Hide the no-textbox and show the path-textbox
    pathNoTextbox.classList.add('hidden');
    pathNoTextbox.classList.remove('show');
    pathTextbox.classList.add('show');
    pathTextbox.classList.remove('hidden');

    // Insert the path info into the path-textbox
    pathTextbox.innerHTML = `
        <img src='./IMG/${path.name}/01/${path.name}_300.jpg'>
        <div class="textbox">
            <h2>${path.name}, ${path.area}</h2>
            <p>${path.description}</p>
        </div>
        <a href="./trail.html?municipality=${path.municipality}&route=${path.route}">Explore</a>
    `;
}

// Filter function
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

    // Clear existing layers
    exploreMap.eachLayer(layer => {
        if (layer instanceof L.GeoJSON || layer instanceof L.Marker) {
            exploreMap.removeLayer(layer);
        }
    });

    // Load filtered paths
    loadGeoJson(filteredPaths);
}

// Apply filters from URL on page load
filterPaths();

// Listen for form submission and update filters
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
