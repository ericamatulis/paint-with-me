function leftToRight() {
  var selectedOpts = $('#available-options option:selected');
          //$('#lstBox2').append($(selectedOpts).clone());

       var x = document.getElementById("edit-list-of-images");
  var listLength = selectedOpts.length;
   for (var i = 0; i < listLength; i++) {
  var option = document.createElement("option");
  option.text = selectedOpts[i].value;
     x.add(option);
   }
  $(selectedOpts).remove();
}

function rightToLeft() {
  var selectedOpts = $('#edit-list-of-images option:selected');
          //$('#lstBox1').append($(selectedOpts).clone());

       var x = document.getElementById("available-options");
  var listLength = selectedOpts.length;
   for (var i = 0; i < listLength; i++) {
  var option = document.createElement("option");
  option.text = selectedOpts[i].value;
     x.add(option);
   }
  $(selectedOpts).remove();
}

var currentOptions = $('#edit-list-of-images')[0].options

var allOptions = document.getElementById("alloptions").value.split("---end---")
allOptions.pop()




function updateOptions() {
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
  document.getElementById("selected_options").value = selections
document.getElementById("update_category").click()
}









var $options2 = $("#edit-list-of-images").clone(); // this will save all initial options in the second dropdown

document.getElementById("selected_category_name2").value = $("#edit-list-of-categories :selected").val(); // The text content of the selected option



$("#edit-list-of-images").html("");

      $options2.find("option").each(function(optionIndex, option) { // a second loop that check if the option value starts with the filter value
        if ($(option)[0].getAttribute("class")==document.getElementById("selected_category_name2").value)
                    $(option).clone().appendTo($("#edit-list-of-images"));

    });



/// As user clicks on image name option, change load selection name to chosen image name
 function load_current_list_of_images(){
  var sel = document.getElementById('edit-list-of-categories')
  var listLength = sel.options.length;
   for (var i = 0; i < listLength; i++) {
        if (sel.options[i].selected) {
            document.getElementById("selected_category_name2").value = sel.options[i].text;

        }
    }
         var value = document.getElementById("selected_category_name2").value

    $("#edit-list-of-images").html("");

      $options2.find("option").each(function(optionIndex, option) { // a second loop that check if the option value starts with the filter value
        if ($(option)[0].getAttribute("class")==value)
                    $(option).clone().appendTo($("#edit-list-of-images"))

    });
     load_available_list_of_images()

}


function load_available_list_of_images(){
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
 
    document.getElementById("alloptions").value=availableOptions
    
}



/// As user clicks on image name option, change load selection name to chosen image name
cat_list2 = $("#edit-list-of-categories"); 
cat_list2.off().on("change",load_current_list_of_images);


load_available_list_of_images()
