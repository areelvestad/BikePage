// geojson-utils.js

// Function to calculate distance between two latitude/longitude points using Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of the Earth in meters
    const toRadians = degrees => degrees * Math.PI / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Function to calculate total length and climb from GeoJSON data
function calculateTotalLengthAndClimb(geojson) {
    let totalLength = 0;
    let highestElevation = -Infinity;
    let lowestElevation = Infinity;

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

                    // Calculate distance
                    totalLength += haversineDistance(lat1, lon1, lat2, lon2);

                    // Track highest and lowest elevations
                    if (ele1 !== undefined && ele2 !== undefined) {
                        if (ele1 > highestElevation) highestElevation = ele1;
                        if (ele1 < lowestElevation) lowestElevation = ele1;
                        if (ele2 > highestElevation) highestElevation = ele2;
                        if (ele2 < lowestElevation) lowestElevation = ele2;
                    }
                }
            }
        });
    }

    const totalClimb = highestElevation - lowestElevation;

    return { totalLength, totalClimb };
}

// Export the function
export { calculateTotalLengthAndClimb };
