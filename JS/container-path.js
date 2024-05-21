// List of path variables
var paths = [Gahperus]; // Add more paths as needed

// Function to create the HTML for a path
function createPathHTML(path) {
    var properties = path.properties;

    // Create a new div element for the path
    var pathDiv = document.createElement('div');
    pathDiv.className = 'path';
    pathDiv.id = properties.name;

    // Create the image element
    var imgElement = document.createElement('img');
    imgElement.src = 'IMG/' + properties.name + '.jpg'; // Assuming image file names match the path names
    imgElement.alt = properties.name;
    pathDiv.appendChild(imgElement);

    // Create the h2 title element
    var titleElement = document.createElement('h2');
    titleElement.id = 'path-title';
    titleElement.textContent = properties.name;
    pathDiv.appendChild(titleElement);

    // Create the description box div
    var descBoxDiv = document.createElement('div');
    descBoxDiv.className = 'path-desc-box';

    // Create the description paragraph
    var descParagraph = document.createElement('p');
    descParagraph.id = 'path-description';
    descParagraph.textContent = properties.description;
    descBoxDiv.appendChild(descParagraph);

    // Create the info div
    var infoDiv = document.createElement('div');
    infoDiv.className = 'path-info';

    // Create the type span
    var typeSpan = document.createElement('span');
    typeSpan.innerHTML = `<b>TYPE: </b><p id="path-type">${properties.type}</p>`;
    infoDiv.appendChild(typeSpan);

    // Create the climb span
    var climbSpan = document.createElement('span');
    climbSpan.innerHTML = `<b>CLIMB: </b><p id="path-climb">${properties.climb}</p>`;
    infoDiv.appendChild(climbSpan);

    // Create the grade span
    var gradeSpan = document.createElement('span');
    gradeSpan.innerHTML = `<b>GRADE: </b><p id="path-grade">${properties.grade}</p>`;
    infoDiv.appendChild(gradeSpan);

    // Add the info div to the description box div
    descBoxDiv.appendChild(infoDiv);

    // Create the explore link
    var exploreLink = document.createElement('a');
    exploreLink.href = `PATHS/${properties.name}.html`; // Assuming HTML file names match the path names

    var exploreDiv = document.createElement('div');
    exploreDiv.className = 'path-explore';
    exploreDiv.textContent = 'E X P L O R E';

    exploreLink.appendChild(exploreDiv);

    // Add the explore link to the description box div
    descBoxDiv.appendChild(exploreLink);

    // Add the description box div to the path div
    pathDiv.appendChild(descBoxDiv);

    return pathDiv;
}

// Function to render all paths
function renderPaths() {
    var container = document.querySelector('.container-path');

    paths.forEach(function(path) {
        var pathHTML = createPathHTML(path);
        container.appendChild(pathHTML);
    });
}

// Call the renderPaths function to add all paths to the HTML
renderPaths();
