// Photoshop Script to Batch Resize and Save Images

// Function to resize and save the image while maintaining aspect ratio
function resizeAndSave(file, sizes, outputFolder) {
    var originalName = file.name.split('.')[0];
    for (var i = 0; i < sizes.length; i++) {
        var size = sizes[i];
        
        // Duplicate the document
        var doc = app.open(file);
        
        // Calculate the new dimensions while maintaining aspect ratio
        var originalWidth = doc.width;
        var originalHeight = doc.height;
        var aspectRatio = originalWidth / originalHeight;
        
        if (originalWidth > originalHeight) {
            var newWidth = size;
            var newHeight = size / aspectRatio;
        } else {
            var newHeight = size;
            var newWidth = size * aspectRatio;
        }

        // Resize the image
        doc.resizeImage(newWidth, newHeight, null, ResampleMethod.BICUBIC);

        // Prepare the save options
        var saveOptions = new JPEGSaveOptions();
        saveOptions.quality = 12;

        // Save the file
        var saveFile = new File(outputFolder + '/' + originalName + '_' + size + '.jpg');
        doc.saveAs(saveFile, saveOptions, true, Extension.LOWERCASE);
        
        // Close the document without saving
        doc.close(SaveOptions.DONOTSAVECHANGES);
    }
}

// Function to select folders and process images
function processFolders() {
    // Select the folder with the images
    var inputFolder = Folder.selectDialog("Select the folder with images to resize");
    if (inputFolder == null) return;

    // Select the output folder
    var outputFolder = Folder.selectDialog("Select the folder to save resized images");
    if (outputFolder == null) return;

    // Define the sizes to which images should be resized
    var sizes = [300, 350, 620, 930]; // Example sizes, you can add more

    // Get all the files in the input folder
    var files = inputFolder.getFiles(function(file) {
        return file instanceof File && file.name.match(/\.(jpg|jpeg|png|tif)$/i);
    });

    // Process each file
    for (var i = 0; i < files.length; i++) {
        resizeAndSave(files[i], sizes, outputFolder);
    }

    alert("Batch resizing and saving completed!");

    // Ask to choose a new folder or cancel
    var continueProcessing = confirm("Do you want to process another folder?");
    if (continueProcessing) {
        processFolders();
    } else {
        alert("Process completed.");
    }
}

// Run the processFolders function
processFolders();
