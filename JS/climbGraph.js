function createClimbGraph(containerId, distanceData, elevationData, smooth = false, factor = 10) {
    let ctx = document.getElementById(containerId).getContext('2d');

    if (smooth) {
        let spline = new CubicSpline(distanceData, elevationData);
        let smoothedDistance = [];
        let smoothedElevation = [];
        let numPoints = distanceData.length / factor;

        for (let i = 0; i <= numPoints; i++) {
            let t = (distanceData.length - 1) * (i / numPoints);
            smoothedDistance.push(t.toFixed(2));
            smoothedElevation.push(spline.at(t));
        }

        distanceData = smoothedDistance;
        elevationData = smoothedElevation;
    } else if (factor > 1) {
        ({ downsampledDistance: distanceData, downsampledElevation: elevationData } = downsampleData(distanceData, elevationData, factor));
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: distanceData,
            datasets: [{
                label: '',
                data: elevationData,
                borderColor: 'rgba(111, 124, 110, .5)',
                backgroundColor: 'rgba(111, 124, 110, .1)',
                borderWidth: 2,
                tension: 0.1,
                pointRadius: 0,
                showLine: true,
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    display: false,
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: false,
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            }
        }
    });
}

function downsampleData(distanceData, elevationData, factor) {
    const downsampledDistance = [];
    const downsampledElevation = [];

    for (let i = 0; i < distanceData.length; i += factor) {
        const end = Math.min(i + factor, distanceData.length);
        const segment = distanceData.slice(i, end);
        const segmentElev = elevationData.slice(i, end);

        const avgDistance = segment.reduce((a, b) => parseFloat(a) + parseFloat(b)) / segment.length;
        const avgElevation = segmentElev.reduce((a, b) => a + b) / segmentElev.length;

        downsampledDistance.push(avgDistance.toFixed(2));
        downsampledElevation.push(avgElevation);
    }

    return { downsampledDistance, downsampledElevation };
}

export { createClimbGraph };
