import { preprocessGeoJSON, geojsonData } from './preprocess-geojson.js';
import { createClimbGraph } from './climbGraph.js';

function createHtmlPaths(listPath) {
    return `
    <style>
        #map${listPath.route} {
            flex: 1;
            width: 100%;
            height: 100%;
            max-height: 100vh;
        }
        #climb-graph-canvas-${listPath.route} {
            height: 0;
        }
    </style>

    <div class="container-path ${listPath.name}${listPath.route}">
        <div class="path-title">
            <h2>${listPath.route}</h2>
            <h3>${listPath.area}, ${listPath.municipality}</h3>
        </div>
        <div class="path-image" style="background-image: url('./IMG/${listPath.name}/01/${listPath.name}_300.jpg');"></div>
        <div class="path-maps"><div id="map${listPath.route}"></div></div>
        <div class="climb-graph">
            <canvas id="climb-graph-canvas-${listPath.route}"></canvas>
        </div>
        <div class="path-info">
            <div class="path-description">${listPath.description}</div>
            <div class="path-button"><a href="./trail.html?municipality=${listPath.municipality}&route=${listPath.route}">Explore</a></div>
            <div class="path-grade">
                <div class="path-grade-length"><b>Length:</b> ${listPath.length} km</div>
                <div class="path-grade-climb"><b>Climb:</b> ${listPath.climb} m</div>
                <div class="path-grade-type"><b>Type:</b> ${listPath.type}</div>
                <div class="path-grade-grade ${listPath.grade}"><b>Grade:</b> ${listPath.grade}</div>
            </div>
        </div>
    </div>
    `;
}

function extractGraphData(geojson) {
    let distanceData = [];
    let elevationData = [];
    let totalDistance = 0;

    if (geojson.features && geojson.features.length > 0) {
        geojson.features.forEach(feature => {
            if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                let coordinates = feature.geometry.coordinates;
                if (feature.geometry.type === 'MultiLineString') {
                    coordinates = coordinates.flat();
                }

                for (let i = 1; i < coordinates.length; i++) {
                    const [lon1, lat1, ele1] = coordinates[i - 1];
                    const [lon2, lat2, ele2] = coordinates[i];

                    const segmentDistance = haversineDistance(lat1, lon1, lat2, lon2) / 1000;
                    totalDistance += segmentDistance;

                    distanceData.push(totalDistance.toFixed(2));
                    elevationData.push(ele2);
                }
            }
        });
    }

    return { distanceData, elevationData };
}

document.addEventListener('DOMContentLoaded', function() {
    const containerPaths = document.getElementById('container-paths');

    preprocessGeoJSON().then(() => {
        geojsonData.forEach(listPath => {
            containerPaths.innerHTML += createHtmlPaths(listPath);
        });

        geojsonData.forEach(listPath => {
            var map = L.map(`map${listPath.route}`, {
                center: [listPath.midpoint.split(',')[0], listPath.midpoint.split(',')[1]],
                zoom: listPath.mapZoom,
                zoomControl: false,
                attributionControl: false,
                fullscreenControl: true
            });

            L.tileLayer('https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4graatone&zoom={z}&x={x}&y={y}', {
                attribution: 'Kartverket'
            }).addTo(map);

            if (listPath.geojson) {
                fetch(listPath.geojson)
                    .then(response => response.json())
                    .then(geojson => {
                        L.geoJSON(geojson, {
                            style: function(feature) {
                                return {
                                    color: 'red',
                                    weight: 3,
                                    opacity: 0.7,
                                    dashArray: '1, 4'
                                };
                            }
                        }).addTo(map);

                        const { distanceData, elevationData } = extractGraphData(geojson);
                        createClimbGraph(`climb-graph-canvas-${listPath.route}`, distanceData, elevationData);
                    })
                    .catch(error => console.error(`Error loading GeoJSON for ${listPath.route}:`, error));
            }

            const mapContainer = document.getElementById(`map${listPath.route}`);
            mapContainer.addEventListener('mouseenter', function() {
                const startLocation = listPath.zoomLocation.split(',').map(Number);
                map.setView(startLocation, listPath.mapZoomStart);
                setTimeout(function() {
                    map.invalidateSize();
                }, 200);
            });

            mapContainer.addEventListener('mouseleave', function() {
                setTimeout(function() {
                    const midpoint = listPath.midpoint.split(',').map(Number);
                    map.setView(midpoint, listPath.mapZoom);
                    setTimeout(function() {
                        map.invalidateSize();
                    }, 200);
                }, 200);
            });
        });
    });
});


function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const toRadians = degrees => degrees * Math.PI / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}
