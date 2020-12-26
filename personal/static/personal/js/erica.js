// Setup
/// Get and define initial variables
var width = 365; // Canvas width
var height = 365; // Canvas height
var isDrawing = false; // Whether currently drawing or not
var current_task = "Draw";

var namefield = document.getElementById("namefield") // Image name to save as
var categoryfield = document.getElementById("categoryfield") // Category name to create
var input_matrix = document.getElementById("input_matrix").value; input_matrix = JSON.parse(input_matrix) // initial input matrix

var undo = [input_matrix] // Undo/Redo Memory (max 10 images)
var undo_i = 0 // Memory pointer

/// Colors
var selected_color = '#ffffff'
var colors = {
  0: '#ffffff',
  1: '#000000',
  2: '#ff0000',
  3: '#008000',
  4: '#0000ff',
  5: '#ffc0cb',
  6: '#ffff00'
};
var color_hexs = {}; for (color_number in colors){color_hexs[colors[color_number]]=color_number} // Reverse dictionary

/// Selected color
var selected_color_box = document.getElementById("selected color box");

/// Get drawing canvas
var drawingCanvas = document.getElementById("drawingCanvas");
  
/// Get drawing canvas context
var drawingCanvas_context = drawingCanvas.getContext("2d");

/// Create canvas of color options
var colorCanvas = document.getElementById("colorCanvas");
var colorCanvas_context = colorCanvas.getContext("2d");

let offset = 0;
for (color_hex in color_hexs){
  colorCanvas_context.beginPath(); colorCanvas_context.rect(offset, 0, 32, 32); colorCanvas_context.fillStyle = color_hex; colorCanvas_context.fill()
  offset += 32;
}

/// Get list of available image options to load
var list_of_options = []

for (k in [...Array(document.getElementById('load-options').options.length).keys()]) {
  list_of_options = list_of_options.concat(document.getElementById('load-options').options[k].value)
}

var $options = $("#load-options").clone(); // this will save all initial options in the second dropdown

$("#load-options").html("");

$options.find("option").each(function(optionIndex, option) { // a second loop that check if the option value is of the selected category
        if ($(option)[0].getAttribute("class")=="all")
          $(option).clone().appendTo($("#load-options"));

    });

/// Initialize canvas

if (document.getElementById("input_matrix_dimensions").value == '-1'){
  image_from_matrix();  
}
else if (parseInt(document.getElementById("input_matrix_dimensions").value) < 1){
  document.getElementById("input_matrix_dimensions").value = 3
      document.getElementById("matrix_dimensions").value = 3

  set_dimensions();
  clear_canvas();
}
else {
  set_dimensions();
  clear_canvas();
}



// EVENT LISTENERS
/// Save image upon enter
namefield.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("save shown").click();
  }
});

/// Create category upon enter
categoryfield.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("create_category").click();
  }
});

/// Clear canvas when setting input_matrix dimensions
document.getElementById('set_dimensions').addEventListener('click', clear_canvas, false);

/// Color dot when user clicks on canvas
drawingCanvas.addEventListener("click", colorDot, false);

/// Change selected color when user clicks on new color
colorCanvas.addEventListener("click", change_color, false);

/// Clear canvas when user clicks on "Clear canvas" button
document.getElementById('clear').addEventListener('click', clear_canvas, false);

/// Drawing events (+ undo action)
drawingCanvas.addEventListener("mouseup", endPath, false);
drawingCanvas.addEventListener("mousedown", beginPath, false);
drawingCanvas.addEventListener("mouseup", addtoUndo2, false);
drawingCanvas.addEventListener("mousemove", drawLine, false);

/// Select brush/bucket events
document.getElementById('bucketimage').addEventListener('click', selectbucket, false);
document.getElementById('brushimage').addEventListener('click', selectbrush, false);

/// When bucket is selected, paint bucket as user clicks on canvas
drawingCanvas.addEventListener("click", paint_bucket, false);

/// As user clicks on image name option, change load selection name to chosen image name
load_list = $(".list-group"); load_list.off().on("click",load);

/// As user clicks on categories, change category selection to include selected ones
document.getElementById('categories').addEventListener('click', selectCategories, false);

/// As user clicks on category name, change load options to images in the category
cat_list = $("#list-of-categories"); cat_list.off().on("change",category_load);



// FUNCTIONS
/// Check if selection has been made before loading an image
function load_shown(){
  if (document.getElementById("selected_matrix_name").value.length > 0){
    document.getElementById("load_hidden").click()
  }
  else {
    window.alert("Please select an image to load.")
  }
}

/// Check if current image can be saved or if user wants to replace existing image before really saving
function save_shown(){
  if (namefield.value.length <= 0){
    window.alert("Please input a name to save as.")
  }
  else if (list_of_options.includes(namefield.value)){
    var answer = window.confirm("Are you sure you want to save over ".concat(namefield.value).concat("?"));
    
    if (answer == true){
      document.getElementById("save_hidden").click()
      window.alert(namefield.value.concat(" has been updated"))
    }
  }
  else {
    document.getElementById("save_hidden").click()
  }
}

/// Change input_matrix dimensions
function set_dimensions(){
  m = document.getElementById("input_matrix_dimensions").value; // Canvas number of columns
  n = document.getElementById("input_matrix_dimensions").value; // Canvas number of rows
  px_width = width/m;
  px_height = height/n;
  //  show_dimensions();
}

/// Change selected color
function change_color(evt) {
  var mousePos = getMousePos(colorCanvas, evt);
  selected_color = (rgbToHex(colorCanvas_context.getImageData(mousePos.x, mousePos.y, 1, 1).data))
  selected_color_box.style.fill = selected_color;
}

/// Clear canvas
function clear_canvas(){
  drawingCanvas_context.clearRect(0, 0, width, height);
  document.getElementById("input_matrix").value =     JSON.stringify(Array.from({length:n},()=>Array.from({length:m},()=>0)));

  addtoUndo(); // add new matrix to memory
}

/// Create an image from a given input_matrix
function image_from_matrix() {  
  // Get input input_matrix
  let input_matrix = document.getElementById("input_matrix").value;
  input_matrix = JSON.parse(input_matrix)
    
    document.getElementById("input_matrix_dimensions").value = input_matrix.length
    document.getElementById("matrix_dimensions").value = input_matrix.length
    set_dimensions()
    
  // For each element in the input_matrix, color a dot in the color matching the element number in an mxn grid style (dot centered in the proper squares)
  for (i = 0; i < input_matrix.length; i++) { 
  for (j = 0; j < input_matrix[i].length; j++){
    color_ij = input_matrix[i][j]
    drawingCanvas_context.beginPath();
    drawingCanvas_context.arc(px_width/2+px_width*j, px_height/2+px_height*i, px_width/2, 0, 2 * Math.PI);
    drawingCanvas_context.fillStyle = colors[color_ij];
    drawingCanvas_context.fill();
    }
  }
}

/// Shift canvas functions
function shift_right(){
  // Get input input_matrix
  let input_matrix = document.getElementById("input_matrix").value;
  input_matrix = JSON.parse(input_matrix)
  for (var i = 0; i < input_matrix.length; i++) {input_matrix[i]=(input_matrix[i].slice(input_matrix[i].length-1,input_matrix[i].length).concat(input_matrix[i].slice(0,input_matrix[i].length-1)))};
  document.getElementById("input_matrix").value = JSON.stringify(input_matrix)
  
  image_from_matrix(); // Draw shifted image
  addtoUndo(); // Add image to memory
};

function shift_left(){
  // Get input input_matrix
  let input_matrix = document.getElementById("input_matrix").value;
  input_matrix = JSON.parse(input_matrix)
  for (var i = 0; i < input_matrix.length; i++) {input_matrix[i]=input_matrix[i].slice(1,input_matrix[i].length).concat(input_matrix[i].slice(0,1))
}
;
  document.getElementById("input_matrix").value = JSON.stringify(input_matrix)
  
  image_from_matrix(); // Draw shifted image
  addtoUndo(); // Add image to memory
};

function shift_up(){
  // Get input input_matrix
  let input_matrix = document.getElementById("input_matrix").value;
  input_matrix = JSON.parse(input_matrix)
  input_matrix=input_matrix.slice(1,input_matrix.length).concat(input_matrix.slice(0,1));
  document.getElementById("input_matrix").value = JSON.stringify(input_matrix)

    image_from_matrix(); // Draw shifted image
  addtoUndo(); // Add image to memory
};

function shift_down(){
  // Get input input_matrix
  let input_matrix = document.getElementById("input_matrix").value;
  input_matrix = JSON.parse(input_matrix)
  input_matrix=(input_matrix.slice(input_matrix.length-1,input_matrix.length).concat(input_matrix.slice(0,input_matrix.length-1)));
  document.getElementById("input_matrix").value = JSON.stringify(input_matrix)
  
  image_from_matrix(); // Draw shifted image
  addtoUndo(); // Add image to memory
};

/// Rotate canvas functions
function rotate_canvas_right(){
  // Get input input_matrix
  let input_matrix = document.getElementById("input_matrix").value;
  input_matrix = JSON.parse(input_matrix)
  input_matrix=rotate_right(input_matrix);
  document.getElementById("input_matrix").value = JSON.stringify(input_matrix)

  image_from_matrix(); // Draw shifted image
  addtoUndo(); // Add image to memory
};

function rotate_canvas_left(){  
  // Get input input_matrix
  let input_matrix = document.getElementById("input_matrix").value;
  input_matrix = JSON.parse(input_matrix)
  input_matrix=rotate_left(input_matrix);
  document.getElementById("input_matrix").value = JSON.stringify(input_matrix)
  
  image_from_matrix(); // Draw shifted image
  addtoUndo(); // Add image to memory
};

/// Invert canvas colors
function invert_colors(){
  // Get input input_matrix
  let input_matrix = document.getElementById("input_matrix").value;
  input_matrix = JSON.parse(input_matrix)
  color_id = parseInt(color_hexs[selected_color])
  
  for (i = 0; i < input_matrix.length; i++){
    for (j = 0; j < input_matrix[i].length; j++) {
      if (input_matrix[i][j]==0){
        input_matrix[i][j]=color_id
      }
      else if (input_matrix[i][j]==color_id){ 
        input_matrix[i][j]=0
      }
	  }
  }

  document.getElementById("input_matrix").value = JSON.stringify(input_matrix)
  
  image_from_matrix(); // Draw shifted image
  addtoUndo(); // Add image to memory
};

/// Drawing functions
//// Color dot that has been clicked on
function color_pixel(mousePos, isDrawing) {
  // Get center of closest pixel square
  closest_x =px_width*Math.floor(mousePos.x/px_width)+px_width/2
  closest_y = px_height*Math.floor(mousePos.y/px_height)+px_height/2
    
  // Get corresponding input_matrix position
  i = Math.round((closest_y-px_height/2)/px_height)
  j = Math.round((closest_x-px_width/2)/px_width)
  
  // Get current image input_matrix
  let input_matrix = document.getElementById("input_matrix").value;
  input_matrix = JSON.parse(input_matrix)
  
  // Paint dot at clicked position (using above coordinates)
  drawingCanvas_context.beginPath();
  drawingCanvas_context.arc(closest_x,closest_y, px_width/2, 0, 2 * Math.PI);
  drawingCanvas_context.fillStyle = selected_color;
  drawingCanvas_context.fill();
  
  // Change input input_matrix so that the correct color now shows in the changed position
  input_matrix[i][j] = parseInt(color_hexs[selected_color]);
  document.getElementById("input_matrix").value = JSON.stringify(input_matrix)
}

//// Draw line on pixels that have been dragged on
function drawLine(evt){
  if (isDrawing == true) {
    // Get mouse position in the canvas
    var mousePos = getMousePos(drawingCanvas, evt);
    color_pixel(mousePos, isDrawing) 
  }
}

//// Color the current pixel
function colorDot(evt){  
  if (isDrawing == false && current_task == "Draw") {
    // Get mouse position in the canvas
    var mousePos = getMousePos(drawingCanvas, evt);
    color_pixel(mousePos, isDrawing) 
    addtoUndo(); // Add image to memory
  }
}

function beginPath(evt) {
  if (current_task == "Draw"){
    isDrawing = true;
  }
}

function endPath(evt) {
    // Get mouse position in the canvas
  if (isDrawing == true){
    isDrawing = false;
  }
}

function inPath(evt){
    if (isDrawing == true) {
      draw_line()
    }
}

//// Paint bucket function
function paint_bucket(evt){
  if (current_task == "Paint Bucket") {
    
    var mousePos = getMousePos(drawingCanvas, evt);
  // Get center of closest pixel square
  closest_x =px_width*Math.floor(mousePos.x/px_width)+px_width/2
  closest_y = px_height*Math.floor(mousePos.y/px_height)+px_height/2
    
  // Get corresponding input_matrix position
  i = Math.round((closest_y-px_height/2)/px_height)
  j = Math.round((closest_x-px_width/2)/px_width)
    
  // Get input input_matrix
  let input_matrix = document.getElementById("input_matrix").value;
  input_matrix = JSON.parse(input_matrix)
  selected_color_id = parseInt(color_hexs[selected_color])
  current_color_id = input_matrix[i][j];
  if (selected_color_id != current_color_id) {
    paint_bucket_matrix(i,j, input_matrix, current_color_id, selected_color_id)
  document.getElementById("input_matrix").value = JSON.stringify(input_matrix)
    
  image_from_matrix(); // Draw shifted image
  addtoUndo(); // Add image to memory
  }
}
}



// HELPER FUNCTIONS
/// Function to get mouse position in the canvas
function getMousePos(canvas, evt) {
  // Gets the position and size of the canvas with respect to the page
  return {
    x: evt.offsetX,
    y: evt.offsetY
  };
}

/// Function to convert RGB color coming from selection to HEX
function rgbToHex(rgb){
  let str = "000000"+((rgb[0] << 16) | (rgb[1] << 8) | rgb[2]).toString(16);
  return '#' + str.substring(str.length - 6, str.length);
};

/// Transpose an array of arrays
function transpose_array(array){
	transposed_array = [];
	for (j = array.length-1; j >= 0; j--){
transposed_array=transposed_array.concat(array[j]);
}
	return transposed_array;
}

/// Get column_i in a matrix (array of arrays)
function get_column_i(matrix, i){
	column_i = [];
	for (j = 0; j < matrix.length; j++){
		column_i = column_i.concat(matrix[j][i]);
	}
	return column_i;
}

/// Rotate matrix to the right (array of arrays)
function rotate_right(matrix){
	rotated_matrix = []
	m = matrix[0].length // number of columns
	for (i = 0; i < m; i++){
		rotated_matrix[i] = (transpose_array(get_column_i(matrix,i)))
	}
	return rotated_matrix;
}

/// Rotate matrix to the left (array of arrays)
function rotate_left(matrix){
	rotated_matrix = []
	m = matrix[0].length // number of columns
	q = 0;
	for (i = m-1; i >= 0; i--){
		rotated_matrix[q] = get_column_i(matrix,i);
		q++;
	}
	return rotated_matrix;
}

/// Paint bucket matrix space
function paint_bucket_matrix(i,j, matrix, color, new_color){
  matrix[i][j] = new_color;
	if (i < (n-1) && matrix[i+1][j] == color){
		matrix[i+1][j] = new_color;
		paint_bucket_matrix(i+1, j, matrix, color, new_color);
	}
	if (j < (m-1) && matrix[i][j+1] == color) {
		matrix[i][j+1] = new_color;
		paint_bucket_matrix(i, j+1, matrix, color, new_color);
	}
	if (j > 0 && matrix[i][j-1] == color) {
		matrix[i][j-1] = new_color;
		paint_bucket_matrix(i, j-1, matrix, color, new_color);
	}
	if (i > 0 && matrix[i-1][j] == color) {
		matrix[i-1][j] = new_color;
		paint_bucket_matrix(i-1, j, matrix, color, new_color);
	}
}

/// Undo/Redo functions
function addtoUndo2(){
  if (isDrawing == true){
    addtoUndo();
  }
}

function addtoUndo(){ 
  undo = undo.slice(0,undo_i+1).concat([JSON.parse(document.getElementById("input_matrix").value)])
  
  if (undo.length > 10) {
    undo.shift()
  }
  undo_i = Math.min(undo_i + 1, 9)
}

function undoLastAction(){
  if (undo_i - 1 >= 0){
    document.getElementById("input_matrix").value = JSON.stringify(undo[undo_i-1])
  undo_i = undo_i - 1
  image_from_matrix()
  }
    
}

function redoLastAction(){
  if ((undo_i+1) < (undo.length)){
      document.getElementById("input_matrix").value = JSON.stringify(undo[undo_i+1])
  undo_i = undo_i + 1
  image_from_matrix()
  }

}

/// Method of drawing selections
function selectbucket(){
  current_task = "Paint Bucket";
  document.getElementById('bucketimage').style = "border:3px solid #333; cursor: pointer;"
  document.getElementById('brushimage').style = "border:1px solid #999; cursor: pointer;"
}

function selectbrush(){
  current_task = "Draw";
  document.getElementById('brushimage').style = "border:3px solid #333; cursor: pointer;"
  document.getElementById('bucketimage').style = "border:1px solid #999; cursor: pointer;"
}

/// As user clicks on image name option, change load selection name to chosen image name
 function load(){
  var sel = document.getElementById('load-options')
  var listLength = sel.options.length;
   for (var i = 0; i < listLength; i++) {
        if (sel.options[i].selected) {
            document.getElementById("selected_matrix_name").value = sel.options[i].text;

        }
    }
}

/// Add selected categories to category selection field
function selectCategories(){
    selections = "all"
    var category_options = document.getElementsByClassName("category-option");
  var listLength = category_options.length;
    
    
    
     for (var i = 0; i < listLength; i++) {
         if (category_options[i].getElementsByTagName("input")[0].checked) {
             if (selections.length == 0){
                 selections = category_options[i].textContent[0].split('\n', 1)[0]
             }
             else {
                 selections = selections + "," + category_options[i].textContent.split('\n', 1)[0]
             }
         }
    }
  document.getElementById("selected_categories").value = selections
}

/// Update dimensions to add to use for saving the matrix
 function updateDimensions(){
    document.getElementById("matrix_dimensions").value = document.getElementById("input_matrix_dimensions").value
}

/// Show dimensions update box
function show_dimensions(){
    var x = document.getElementById("matrix_dimensions_div")
      if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
        var x = document.getElementById("matrix_and_save_div")
      if (x.style.display != "none") {
    x.style.display = "none";
  }
            var x = document.getElementById("load_section")
      if (x.style.display != "none") {
    x.style.display = "none";
  }

}

/// Show save box
function show_save(){
    var x = document.getElementById("matrix_and_save_div")
      if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
    var x = document.getElementById("matrix_dimensions_div")
      if (x.style.display != "none") {
    x.style.display = "none";
  }
        var x = document.getElementById("load_section")
      if (x.style.display != "none") {
    x.style.display = "none";
  }
}

/// Show load box
function view_load(){
    var x = document.getElementById("load_section")
      if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
    var x = document.getElementById("matrix_dimensions_div")
      if (x.style.display != "none") {
    x.style.display = "none";
  }
            var x = document.getElementById("matrix_and_save_div")
      if (x.style.display != "none") {
    x.style.display = "none";
  }
}

/// View category creation box
function view_category_creation(){
    var x = document.getElementById("category_creation_div")
      if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

/// As user clicks on image name option, change load selection name to chosen image name
 function category_load(){
  var sel = document.getElementById('list-of-categories')
  var listLength = sel.options.length;
   for (var i = 0; i < listLength; i++) {
        if (sel.options[i].selected) {
            document.getElementById("selected_category_name").value = sel.options[i].text;

        }
    }
         var value = document.getElementById("selected_category_name").value

    $("#load-options").html("");

      $options.find("option").each(function(optionIndex, option) { // a second loop that check if the option value starts with the filter value
        if ($(option)[0].getAttribute("class")==value)
          $(option).clone().appendTo($("#load-options"));

    });
}
