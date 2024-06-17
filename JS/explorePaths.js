import { createClimbGraph } from './climbGraph.js';
import { listPaths } from './listPaths.js';

var exploreMap = L.map('explore-map').setView([69.6500, 21.2900], 9);
    L.tileLayer('https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}', {
        attribution: 'Kartverket'
    }).addTo(exploreMap);

    listPaths.forEach(listPaths => {
        fetch(listPaths.geojson)
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
                }
            }).addTo(exploreMap);
        })
        .catch(error => console.error(`Error loading GeoJSON for ${listPaths.route}:`, error)); 
    });

