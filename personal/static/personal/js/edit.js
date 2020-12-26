//// SCRIPT FOR EDIT VIEWS

/// INITIALIZE VARIABLES
// Get all images in selected group/category
var currentOptions = $('#edit-list-of-images')[0].options

// Get all available images (including selection)
var allOptions = document.getElementById("alloptions").value.split("---end---"); allOptions.pop()

var $all_images = $("#edit-list-of-images").clone(); // this will save all initial options in the second dropdown

document.getElementById("selected_name_edit").value = $("#edit-list-of-categorygroup :selected").val(); // The text content of the selected option

var matrices = JSON.parse(document.getElementById("matrices").value)

var colors = {
  0: '#ffffff',
  1: '#000000',
  2: '#ff0000',
  3: '#008000',
  4: '#0000ff',
  5: '#ffc0cb',
  6: '#ffff00'
};

// Get images canvas
var imageCanvas = document.getElementById("image_canvas"); // available canvas
var imageCanvas2 = document.getElementById("image_canvas2"); // current category/group canvas
  
// Get images canvas context
var imageCanvas_context = imageCanvas.getContext("2d");
var imageCanvas2_context = imageCanvas2.getContext("2d");

// Timeouts to hide/show image based on time
var image_available_timeout;
var image_selected_timeout;


/// FUNCTIONS
// Function to bring items from left box to right box
function rightToLeft() {
    var selectedOpts = $('#available-options option:selected'); // Get list of selected options
    var currentImages = document.getElementById("edit-list-of-images"); // Get list of images in selection
    var listLength = selectedOpts.length; // Number of selected options to bring to right
    for (var i = 0; i < listLength; i++) { // for each option, create option element with that value and add to list of images in selection
        var option = document.createElement("option");
        option.text = selectedOpts[i].value;
        currentImages.add(option);
    }
    $(selectedOpts).remove();
    
    if (listLength > 0) {
        document.getElementById("update-category-button").style.display="block";
    }
}

// Function to bring items from right box to left box
function leftToRight() {
    var selectedOpts = $('#edit-list-of-images option:selected'); // Get list of selected options
    var availableImages = document.getElementById("available-options"); // Get list of images available
    var listLength = selectedOpts.length; // Number of selected options to bring to left
    for (var i = 0; i < listLength; i++) { // for each option, create option element with that value and add to list of images available (remove from images in category/group)
        var option = document.createElement("option");
        option.text = selectedOpts[i].value;
         availableImages.add(option);
        }
    $(selectedOpts).remove();
    
    if (listLength > 0) {
        document.getElementById("update-category-button").style.display="block";
    }
}

// Update options inside of category
function updateOptions() {
    // Get list of selections to include in category/group
    selections = ""
    var listLength = currentOptions.length;

    for (var i = 0; i < listLength; i++) {
             if (selections.length == 0){
                 selections = currentOptions[i].textContent
             }
             else {
                 selections = selections + "," + currentOptions[i].textContent
             }
    }

    // Update HTML element so Django can access the selections
    document.getElementById("selected_options").value = selections
    document.getElementById("update_categorygroup").click()
}

/// As user clicks on category/group, change load options accordingly
 function load_lists_of_images(){
     
    /// Update list of current images

    // Change selected category/group name based on selection
     document.getElementById("selected_name_edit").value = $("#edit-list-of-categorygroup :selected").val();
     
     $("#edit-list-of-images").html("");

     $all_images.find("option").each(function(optionIndex, option) { // if image is part of selected group/category, show in list of current images
        if ($(option)[0].getAttribute("class")==document.getElementById("selected_name_edit").value)
                    $(option).clone().appendTo($("#edit-list-of-images"))

    });
     
     
    /// Also update list of available images
    var editListofImages = []
    $("#edit-list-of-images option").each(function() {
    editListofImages=editListofImages.concat(this.value);
    });
    var availableOptions = allOptions.filter(x => !editListofImages.includes(x) );

    var listLength = availableOptions.length;

    var availableOptSelect = document.getElementById("available-options")

    $('#available-options').children().remove().end()

    for (var i =0; i < listLength; i++){
    var option = document.createElement("option")
        option.text = availableOptions[i]
        availableOptSelect.add(option);} 

}

/// Delete category/group
function delete_categorygroup(){
    // Get category/group name
    var delete_name = document.getElementById("selected_name_edit").value
    // Check if user really wants to delete category
    var answer = window.confirm("Are you sure you want to delete ".concat(delete_name).concat("?"));
    
    // If yes, click on delete category button (submit form to Django)
    if (answer == true){
      document.getElementById("delete_categorygroup").click()
      window.alert(delete_name.concat(" has been deleted"))
    }

    
}

/// Set timeout to show/hide image clicked on (available)
function show_hide_image_available() {
    clearTimeout(image_available_timeout);
    document.getElementById("image_canvas").style.display="block"    
    image_available_timeout = setTimeout(function(){document.getElementById("image_canvas").style.display="none"},2000);

}

/// Create available image from selected option (available)
function image_from_selection_available() {  
    selection = $("#available-options :selected").val();
   
  input_matrix = JSON.parse(matrices[selection])
    
    m = input_matrix.length
    n = input_matrix.length
    px_width = document.getElementById("image_canvas").width/m;
    px_height = document.getElementById("image_canvas").height/n;
    
    imageCanvas_context.clearRect(0, 0, document.getElementById("image_canvas").width, document.getElementById("image_canvas").height);

  // For each element in the input_matrix, color a dot in the color matching the element number in an mxn grid style (dot centered in the proper squares)
  for (i = 0; i < input_matrix.length; i++) { 
  for (j = 0; j < input_matrix[i].length; j++){
    color_ij = input_matrix[i][j]
    imageCanvas_context.beginPath();
    imageCanvas_context.arc(px_width/2+px_width*j, px_height/2+px_height*i, px_width/2, 0, 2 * Math.PI);
    imageCanvas_context.fillStyle = colors[color_ij];
    imageCanvas_context.fill();
    }
  }
}

/// Set timeout to show/hide image clicked on (current)
function show_hide_image_current() {
    clearTimeout(image_selected_timeout);
    document.getElementById("image_canvas2").style.display="block"
    image_selected_timeout = setTimeout(function(){document.getElementById("image_canvas2").style.display="none"},2000);

}

/// Create image from selected option (selected)
function image_from_selection_current() {  
    selection = $("#edit-list-of-images :selected").val();
   
  input_matrix = JSON.parse(matrices[selection])
    
    m = input_matrix.length
    n = input_matrix.length
    px_width = document.getElementById("image_canvas2").width/m;
    px_height = document.getElementById("image_canvas2").height/n;
    
    imageCanvas2_context.clearRect(0, 0, document.getElementById("image_canvas2").width, document.getElementById("image_canvas2").height);

  // For each element in the input_matrix, color a dot in the color matching the element number in an mxn grid style (dot centered in the proper squares)
  for (i = 0; i < input_matrix.length; i++) { 
  for (j = 0; j < input_matrix[i].length; j++){
    color_ij = input_matrix[i][j]
    imageCanvas2_context.beginPath();
    imageCanvas2_context.arc(px_width/2+px_width*j, px_height/2+px_height*i, px_width/2, 0, 2 * Math.PI);
    imageCanvas2_context.fillStyle = colors[color_ij];
    imageCanvas2_context.fill();
    }
  }
}

/// Show different containers based on category/group selection
function show_views(){
    if ($("#edit-list-of-categorygroup :selected").val() == "-1"){ // If option value is -1, don't show any containers (with lists)
        $('.categoryshow').each(function(i, obj) {
            obj.style.display = "none";
        });
        document.getElementById("deletecategory").disabled=true; // Disable delete category button
        document.getElementById("category_creation_div").style.display="block"  // Show category creation block
        document.getElementById("deletecategory").style.cursor = "not-allowed" // Set delete category button style
        document.getElementById("deletecategory").style.color = "#CCC" // Set delete category button style
        document.getElementById("deletecategory").style.backgroundColor = "#EEE" // Set delete category button style

        $('#available-options').children().remove().end() // Remove all selections

        $('#edit-list-of-images').children().remove().end() // Remove all selections
    }
    
    else {
        document.getElementById("deletecategory").disabled=false; // Enable delete category button
        document.getElementById("deletecategory").style.cursor = "pointer" // Set delete category button style
        document.getElementById("deletecategory").style.color = "#333" // Set delete category button style
        document.getElementById("deletecategory").style.backgroundColor = "#FFF" // Set delete category button style
        document.getElementById("category_creation_div").style.display="none" // Hide category creation block
        
        load_lists_of_images(); // Load images in selection
        
        // Show all lists containers/buttons
        $('.categoryshow').each(function(i, obj) {
        obj.style.display = "block";
        });
        
        document.getElementById("update-category-button").style.display="none"; // Hide update button
        }
}


/// EVENT LISTENERS

// Show image thumbnails as user changes or clicks on options
$("#available-options").click(show_hide_image_available)

$("#available-options").click(image_from_selection_available)

$("#available-options").change(show_hide_image_available)

$("#available-options").change(image_from_selection_available)

$("#edit-list-of-images").click(show_hide_image_current)

$("#edit-list-of-images").click(image_from_selection_current)

$("#edit-list-of-images").change(show_hide_image_current)

$("#edit-list-of-images").change(image_from_selection_current)


/// INITIALIZE
// Initialize view by either reloading selection or asking user to select a category/group
var initial_selection = document.getElementById("load_edit_selection").value
if (initial_selection != "0"){
    $('#edit-list-of-categorygroup').val(initial_selection);
    show_views()
}
