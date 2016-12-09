"use strict";

//Creates the template canvases, the delete buttons, and sets up the templates
//on the canvases
const draw = (draws, ctx) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for(var i = 0; i < draws.length; i++){
    const drawCall = draws[i];
    ctx.strokeStyle = drawCall.stroke;
    ctx.lineWidth = drawCall.line;
    
    if(drawCall.shape === 'rect'){
      ctx.strokeRect(drawCall.x,drawCall.y,drawCall.w,drawCall.h); 
    } else if(drawCall.shape === 'circle'){
      ctx.beginPath();
      ctx.arc(drawCall.x,drawCall.y,drawCall.rad,0,Math.PI * 2,false);
      ctx.closePath();
      ctx.stroke();
    } else if(drawCall.shape === 'line'){
      ctx.beginPath();
      ctx.moveTo(drawCall.x, drawCall.y);
      ctx.lineTo(drawCall.x2, drawCall.y2);
      ctx.stroke();
    }

    ctx.drawImage(hiddenCanvas,0,0);  
  }
};

const init = () => {
  var drawsArray = document.getElementById("templates").children[0].children;
  
  if(drawsArray.length > 0){
    var templates = {};
    //populate templates object
    for(var i = 0; i < drawsArray.length; i++){
      templates[i] = {calls: [], id: drawsArray[i].id};
      for(var j = 0; j < drawsArray[i].children.length; j++){
        templates[i].calls[j] = {};
        templates[i].calls[j]["shape"] = drawsArray[i].children[j].children[0].innerHTML;
        templates[i].calls[j]["x"] = drawsArray[i].children[j].children[1].innerHTML;
        templates[i].calls[j]["y"] = drawsArray[i].children[j].children[2].innerHTML;
        templates[i].calls[j]["line"] = drawsArray[i].children[j].children[8].innerHTML;
        if(drawsArray[i].children[j].children[0].innerHTML === "rect"){
          templates[i].calls[j]["w"] = drawsArray[i].children[j].children[3].innerHTML;
          templates[i].calls[j]["h"] = drawsArray[i].children[j].children[4].innerHTML;
        } else if(drawsArray[i].children[j].children[0].innerHTML === "circle"){
          templates[i].calls[j]["rad"] = drawsArray[i].children[j].children[5].innerHTML;
        } else if (drawsArray[i].children[j].children[0].innerHTML === "line"){
          templates[i].calls[j]["x2"] = drawsArray[i].children[j].children[6].innerHTML;
          templates[i].calls[j]["y2"] = drawsArray[i].children[j].children[7].innerHTML;
        }
      }
    }

    var keys = Object.keys(templates);
    var canvases = document.getElementById("canvases");
    var width = 280;
    var height = 200;
    var horizPadding = 20;

    var hiddenCanvas = document.querySelector('#hiddenCanvas');
    var ctx = hiddenCanvas.getContext('2d');

    for(var i = 0; i < keys.length; i++){
      var div = document.createElement("div");
      div.className = "templateDiv";
      div.id = templates[keys[i]].id;

      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.className = "templateCanvas";
      canvas.id = templates[keys[i]].id;
      canvas.style.background = "rgb(255,255,255)";
      canvas.onclick = (e) => {
        var target = $(e.target);
        var token = document.getElementById("templates").children[0].id;
        var id = target[0].id;
        var url = "/fill/" + id;
        window.location = url;        
      };

      var button = document.createElement("p");
      button.classList.add("deleteButton");
      button.classList.add("btn");
      button.classList.add("btn-default");
      button.onclick = (e) => {
        var target = $(e.target);
        var id = target[0].parentElement.id;
        var url = "/remove/" + id;
        var token = document.getElementById("templates").children[0].id;

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

      div.appendChild(canvas);
      div.appendChild(button);
      canvases.appendChild(div);
      var thumbnailCtx = canvas.getContext('2d');    

      draw(templates[keys[i]].calls, ctx);
      var imgData = hiddenCanvas.toDataURL();
      var thumbnail = new Image();
      thumbnail.src = imgData;
      thumbnailCtx.drawImage(thumbnail,0,0,width,height);
    }    
  } else {
    $("#templateAlert").css("display","block");
  }
};

window.onload = init;
