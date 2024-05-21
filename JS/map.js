var map = L.map('map').setView([69.5236, 21.32197], 12);

L.tileLayer('https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}', {
attribution: '<a href="http://www.kartverket.no/">Kartverket</a>'
}).addTo(map);