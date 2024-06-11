import { calculateTotalLengthAndClimb } from './geojson-utils.js';
import { listPaths } from './listPaths.js';

const geojsonData = [];

function preprocessGeoJSON() {
    const promises = listPaths.map(listPath => {
        if (listPath.geojson) {
            return fetch(listPath.geojson)
                .then(response => response.json())
                .then(geojson => {
                    const { totalLength, totalClimb } = calculateTotalLengthAndClimb(geojson);
                    geojsonData.push({
                        ...listPath,
                        length: (totalLength / 1000).toFixed(1),
                        climb: totalClimb.toFixed(0) 
                    });
                })
                .catch(error => console.error('Error loading GeoJSON:', error));
        } else {
            geojsonData.push({
                ...listPath,
                length: '0.00',
                climb: '0.00'
            });
        }
    });

    return Promise.all(promises).then(() => {
        console.log('GeoJSON Data:', geojsonData);
    });
}

export { preprocessGeoJSON, geojsonData };
