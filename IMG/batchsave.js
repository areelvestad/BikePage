// Photoshop Script to Batch Resize and Save Images

// Function to resize and save the image
function resizeAndSave(file, sizes, outputFolder) {
    var originalName = file.name.split('.')[0];
    for (var i = 0; i < sizes.length; i++) {
        var size = sizes[i];
        
        // Duplicate the document
        var doc = app.open(file);
        
        // Resize the image
        doc.resizeImage(size, size, null, ResampleMethod.BICUBIC);

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

// Main function
function main() {
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
}

// Run the main function
main();
