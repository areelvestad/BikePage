function addPathsToMap(paths) {
    paths.forEach(function(pathCollection) {
        L.geoJSON(pathCollection, {
            style: function(feature) {
                return {
                    color: '#f00',
                    weight: 2,
                    opacity: 1
                };
            }
        }).addTo(map);
    });
}

addPathsToMap(paths);