"use strict";

//Creates the galley canvases, the export and delete buttons, and sets up the images
//on the canvases
const init = () =>{
  let pictureUrls = document.getElementById("pictures").children[0].children;
  let urls = [];
  for(let i = 0;i < pictureUrls.length;i++){
    urls[i] = {};
    urls[i].url = pictureUrls[i].innerHTML;
    urls[i].id = pictureUrls[i].id;
  }
  
  let canvases = document.getElementById("canvases");
  let width = 280;
  let height = 200;
  let horizPadding = 20;
  
  let hiddenCanvas = document.querySelector('#hiddenCanvas');
  let ctx = hiddenCanvas.getContext('2d');
  
  if(urls.length > 0){
    for(let i = 0; i < urls.length; i++){
      let div = document.createElement("div");
      div.className = "pictureDiv";
      div.id = urls[i].id;
      
      let canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.className = "pictureCanvas";
      canvas.id = urls[i].id;
      canvas.style.background = "rgb(255,255,255)";
      canvas.style.cursor = "default";
      
      let deleteButton = document.createElement("p");
      deleteButton.classList.add("deleteButton");
      deleteButton.classList.add("btn");
      deleteButton.classList.add("btn-default");    
      deleteButton.setAttribute("data-toggle","tooltip");
      deleteButton.setAttribute("data-placement","bottom");
      deleteButton.setAttribute("title","delete");
      deleteButton.onclick = (e) => {
        let target = $(e.target);
        let id = target[0].parentElement.id;
        let url = "/removePic/" + id;
        let token = document.getElementById("pictures").children[0].id;
        
        let modal = document.getElementById('deleteModal');
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
      
      let exportButton = document.createElement("p");
      exportButton.classList.add("exportButton");
      exportButton.classList.add("btn");
      exportButton.classList.add("btn-default");
      exportButton.setAttribute("data-toggle","tooltip");
      exportButton.setAttribute("data-placement","bottom");
      exportButton.setAttribute("title","export");
      exportButton.onclick = (e) => {
        let target = $(e.target)[0].parentNode.children[0];
        // open a new window and load the image in it
        // http://www.w3schools.com/jsref/met_win_open.asp
        let data = target.toDataURL(); 
        let windowName = "canvasImage";
        let windowOptions = "left=0,top=0,width=" + target.width + ",height=" + target.height +",toolbar=0,resizable=0";
        let myWindow = window.open(data,windowName,windowOptions);
        myWindow.resizeTo(target.width,target.height); // needed so Chrome would display image
      };
      
      div.appendChild(canvas);
      div.appendChild(deleteButton);
      div.appendChild(exportButton);
      canvases.appendChild(div);
      let thumbnailCtx = canvas.getContext('2d');    

      let thumbnail = new Image();
      thumbnail.src = urls[i].url;
      thumbnailCtx.drawImage(thumbnail,0,0,width,height);
    }    
  } else{
    $("#galleryAlert").css("display","block");
  }
};


window.onload = init;
