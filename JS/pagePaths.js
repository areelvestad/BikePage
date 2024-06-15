import { preprocessGeoJSON, geojsonData } from './preprocess-geojson.js';
import { createClimbGraph } from './climbGraph.js';

async function createHtmlPaths(listPath) {
    const images = await fetchImagesAndDescriptions(listPath.name);
    const imagesHtml = images.map((image, index) => `
        <div class="trail-image ${index === 0 ? 'active' : ''}">
            <img src="${image.src}" alt="${listPath.name}">
            <div class="image-description"><p>${image.description}</p></div>
        </div>
    `).join('');

    return `
    <style>
        #map${listPath.route} {
            flex: 1;
            width: 100%;
            height: 100%;
            max-height: 100vh;
        }
        #trail-climb-graph-canvas-${listPath.route} {
            height: 100%;
            width: 100%;
        }  
    </style>

    <div class="container-trail">
        <div class="trail-title">
            <h2>${listPath.route}</h2>
            <h3>${listPath.area}, ${listPath.municipality}</h3>
        </div>
        <div class="trail-images">
            <div class="slider-wrapper">
                ${imagesHtml}
                <button class="prev">❮</button>
                <button class="next">❯</button>
                <div class="slider-indicator">
                    ${images.map((_, index) => `<span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`).join('')}
                </div>
            </div>
        </div>
        <div class="trail-info">
            <div class="desc-map-graph">
                <div class="trail-description">${listPath.descriptionLong}</div>
                <div class="aside-info">
                    <div class="trail-maps">
                        <div id="map${listPath.route}"></div>
                    </div>
                    <div class="trail-graph">
                        <h3>Trail info</h3>
                        <div class="trail-info-aside">
                            <div class="trail-grade-length"><b>Length:</b> ${listPath.length} km</div>
                            <div class="trail-grade-climb"><b>Climb:</b> ${listPath.climb} m</div>
                            <div class="trail-grade-type"><b>Type:</b> ${listPath.type}</div>
                            <div class="trail-grade-grade ${listPath.grade}"><b>Grade:</b> ${listPath.grade}</div>
                        </div>
                        <div class="trail-climb-graph">
                            <canvas id="trail-climb-graph-canvas-${listPath.route}"></canvas>
                        </div>
                        <div class="trail-desc-heightmap">Heightmap from top to bottom</div>
                    </div>
                </div>
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
    const urlParams = new URLSearchParams(window.location.search);
    const municipality = urlParams.get('municipality');
    const route = urlParams.get('route');

    if (!municipality || !route) {
        console.error('Missing municipality or route parameters');
        return;
    }

    preprocessGeoJSON().then(async () => {
        const listPath = geojsonData.find(path => path.municipality === municipality && path.route === route);

        if (!listPath) {
            console.error('No matching path found');
            return;
        }

        const containerPaths = document.getElementById('container-paths');
        if (!containerPaths) {
            console.error('Container for paths not found');
            return;
        }
        
        containerPaths.innerHTML = await createHtmlPaths(listPath);

        const map = L.map(`map${listPath.route}`, {
            center: [listPath.midpoint.split(',')[0], listPath.midpoint.split(',')[1]],
            zoom: listPath.mapZoomPage,
            zoomControl: false,
            attributionControl: false,
            fullscreenControl: true
        });

        L.tileLayer('https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}', {
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
                    createClimbGraph(`trail-climb-graph-canvas-${listPath.route}`, distanceData, elevationData);
                })
                .catch(error => console.error(`Error loading GeoJSON for ${listPath.route}:`, error));
        }


        const slides = document.querySelectorAll('.trail-image');
        const dots = document.querySelectorAll('.dot');
        let currentIndex = 0;

        function showSlide(index) {
            if (index >= slides.length) {
                currentIndex = 0;
            } else if (index < 0) {
                currentIndex = slides.length - 1;
            } else {
                currentIndex = index;
            }

            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === currentIndex);
                dots[i].classList.toggle('active', i === currentIndex);
            });
        }

        document.querySelector('.prev').addEventListener('click', () => {
            showSlide(currentIndex - 1);
        });

        document.querySelector('.next').addEventListener('click', () => {
            showSlide(currentIndex + 1);
        });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                showSlide(parseInt(dot.getAttribute('data-index')));
            });
        });
    });
});


function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const toRadians = degrees => degrees * Math.PI / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lat2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

async function fetchImagesAndDescriptions(pathName) {
    const images = [];

    for (let i = 1; i <= 99; i++) {
        const folderName = String(i).padStart(2, '0');
        const imagePath = `./IMG/${pathName}/${folderName}/${pathName}_930.jpg`;
        const descPath = `./IMG/${pathName}/${folderName}/desc.txt`;

        try {
            const response = await fetch(imagePath, { method: 'HEAD' });
            if (response.ok) {
                let description = '';
                try {
                    const descResponse = await fetch(descPath);
                    if (descResponse.ok) {
                        description = await descResponse.text();
                    }
                } catch (error) {
                    console.error('Error fetching description:', error);
                }
                images.push({ src: imagePath, description: description.trim() });
            } else {
                break;
            }
        } catch (error) {
            console.error('Error fetching image:', error);
            break;
        }
    }

    return images;
}
