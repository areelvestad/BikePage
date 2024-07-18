import { listPaths } from './listPaths.js';

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYmIwMDE3My01NzBlLTQ2MGQtYTBlYS1lMmRmOGY5NjcxMTYiLCJpZCI6MjI4NTYwLCJpYXQiOjE3MjEwNzYxMjl9.w1AiAHTQP91nxRytXEy6M7MwJ41qWst1p8NgfygrWUE';

const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain(),
    imageryProvider: Cesium.createWorldImagery(),
    animation: false,
    timeline: false
});

viewer.scene.globe.depthTestAgainstTerrain = true;

viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(21.30, 69.35, 15000),
    orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-35),
        roll: 0.0
    }
});

const pinBuilder = new Cesium.PinBuilder();
const routesPromise = [];

listPaths.forEach(path => {
    const promise = fetch(path.geojson)
        .then(response => response.json())
        .then(geojson => {
            const geoJsonDataSource = Cesium.GeoJsonDataSource.load(geojson, {
                stroke: Cesium.Color.RED,
                fill: Cesium.Color.RED.withAlpha(0.5),
                strokeWidth: 4,
                clampToGround: true
            });

            viewer.dataSources.add(geoJsonDataSource);
            geoJsonDataSource.then(dataSource => {
                const entities = dataSource.entities.values;
                if (entities.length > 0) {
                    const firstEntity = entities[0];
                    if (firstEntity.polyline && firstEntity.polyline.positions) {
                        const positions = firstEntity.polyline.positions.getValue(Cesium.JulianDate.now());
                        if (positions && positions.length > 0) {
                            const startPosition = positions[0];
                            const cartographic = Cesium.Cartographic.fromCartesian(startPosition);
                            const longitude = Cesium.Math.toDegrees(cartographic.longitude);
                            const latitude = Cesium.Math.toDegrees(cartographic.latitude);

                            viewer.entities.add({
                                position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                                billboard: {
                                    image: pinBuilder.fromText(path.grade.toUpperCase(), Cesium.Color.RED, 48).toDataURL(),
                                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                                },
                                description: `
                                    <h2>${path.name}</h2>
                                    <p>${path.description}</p>
                                    <p><b>Type:</b> ${path.type}</p>
                                    <p><b>Grade:</b> ${path.grade}</p>
                                `
                            });
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error loading GeoJSON:', error));

    routesPromise.push(promise);
});

Promise.all(routesPromise).then(() => {
    viewer.flyTo(viewer.dataSources);
});
