// Function to create the HTML for a path
function createPathHTML(properties) {
    var pathDiv = document.createElement('div');
    pathDiv.className = 'path';
    pathDiv.id = properties.name;

    var imgElement = document.createElement('img');
    imgElement.src = 'IMG/' + properties.name + '.jpg'; // Assuming image file names match the path names
    imgElement.alt = properties.name;
    pathDiv.appendChild(imgElement);

    var titleElement = document.createElement('h2');
    titleElement.id = 'path-title';
    titleElement.textContent = properties.name;
    pathDiv.appendChild(titleElement);

    var descBoxDiv = document.createElement('div');
    descBoxDiv.className = 'path-desc-box';

    var descParagraph = document.createElement('p');
    descParagraph.id = 'path-description';
    descParagraph.textContent = properties.description;
    descBoxDiv.appendChild(descParagraph);

    var infoDiv = document.createElement('div');
    infoDiv.className = 'path-info';

    var typeSpan = document.createElement('span');
    typeSpan.innerHTML = `<b>TYPE: </b><p id="path-type">${properties.type}</p>`;
    infoDiv.appendChild(typeSpan);

    var climbSpan = document.createElement('span');
    climbSpan.innerHTML = `<b>CLIMB: </b><p id="path-climb">${properties.climb}</p>`;
    infoDiv.appendChild(climbSpan);

    var gradeSpan = document.createElement('span');
    gradeSpan.innerHTML = `<b>GRADE: </b><p id="path-grade">${properties.grade}</p>`;
    infoDiv.appendChild(gradeSpan);

    descBoxDiv.appendChild(infoDiv);

    var exploreLink = document.createElement('a');
    exploreLink.href = `PATHS/${properties.name}.html`; // Assuming HTML file names match the path names

    var exploreDiv = document.createElement('div');
    exploreDiv.className = 'path-explore';
    exploreDiv.textContent = 'E X P L O R E';

    exploreLink.appendChild(exploreDiv);
    descBoxDiv.appendChild(exploreLink);

    pathDiv.appendChild(descBoxDiv);

    return pathDiv;
}

// Function to render all paths
function renderPaths() {
    var container = document.querySelector('.container-path');
    
    // Iterate over each path in the paths array
    paths.forEach(function(pathCollection) {
        // Iterate over each feature in the current path collection
        pathCollection.features.forEach(function(feature) {
            var pathHTML = createPathHTML(feature.properties);
            container.appendChild(pathHTML);
        });
    });
}

// Call the renderPaths function to add all paths to the HTML
renderPaths();
