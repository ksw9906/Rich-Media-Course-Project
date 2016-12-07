"use strict";
const init = () =>{
  
  var pictureUrls = document.getElementById("pictures").children[0].children;
  var urls = [];
  for(var i = 0;i < pictureUrls.length;i++){
    urls[i] = {};
    urls[i].url = pictureUrls[i].innerHTML;
    urls[i].id = pictureUrls[i].id;
  }
  
  var canvases = document.getElementById("canvases");
  var width = 280;
  var height = 200;
  var horizPadding = 20;
  
  var hiddenCanvas = document.querySelector('#hiddenCanvas');
  var ctx = hiddenCanvas.getContext('2d');
  
  if(urls.length > 0){
    for(var i = 0; i < urls.length; i++){
      var div = document.createElement("div");
      div.className = "pictureDiv";
      div.id = urls[i].id;
      
      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.className = "pictureCanvas";
      canvas.id = urls[i].id;
      canvas.style.background = "rgb(255,255,255)";
      canvas.style.cursor = "default";
      
      var deleteButton = document.createElement("p");
      deleteButton.classList.add("deleteButton");
      deleteButton.classList.add("btn");
      deleteButton.classList.add("btn-default");
      deleteButton.onclick = (e) => {
        var target = $(e.target);
        var id = target[0].parentElement.id;
        var url = "/removePic/" + id;
        var token = document.getElementById("pictures").children[0].id;
        
        var modal = document.getElementById('deleteModal');
        modal.style.display = "block";

        document.getElementById('cancelButton').onclick = () => {
          modal.style.display = "none";
        };

        document.getElementById('formDeleteButton').onclick = (e) => {
          e.preventDefault();

          $.ajax({
              cache: false,
              type: "POST",
              url: url,
              data: {_csrf: token},
              dataType: "json",
              success: (result, status, xhr) => {
                window.location = result.redirect;
              },
              error: (xhr, status, error) => {
                console.log(error);
              }
          });
        };        
      };
      
      var exportButton = document.createElement("p");
      exportButton.classList.add("exportButton");
      exportButton.classList.add("btn");
      exportButton.classList.add("btn-default");
      exportButton.onclick = (e) => {
        var target = $(e.target)[0].parentNode.children[0];
        // open a new window and load the image in it
        // http://www.w3schools.com/jsref/met_win_open.asp
        var data = target.toDataURL(); 
        var windowName = "canvasImage";
        var windowOptions = "left=0,top=0,width=" + target.width + ",height=" + target.height +",toolbar=0,resizable=0";
        var myWindow = window.open(data,windowName,windowOptions);
        myWindow.resizeTo(target.width,target.height); // needed so Chrome would display image
      };
      
      div.appendChild(canvas);
      div.appendChild(deleteButton);
      div.appendChild(exportButton);
      canvases.appendChild(div);
      var thumbnailCtx = canvas.getContext('2d');    

      var thumbnail = new Image();
      thumbnail.src = urls[i].url;
      thumbnailCtx.drawImage(thumbnail,0,0,width,height);
    }    
  } else{
    $("#galleryAlert").css("display","block");
  }
};


window.onload = init;
