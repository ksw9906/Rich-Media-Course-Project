"use strict";
//Fill code: https://github.com/williammalone/HTML5-Paint-Bucket-Tool/blob/master/html5-canvas-paint-bucket.js

// VARIABLES
let canvas,ctx,dragging=false,lineWidth,strokeStyle;
let currentTool, fillStyle, origin, topCavas, topCtx;
let rectX,rectY,rectW,rectH,circX,circY,circRad;
let rSlide, gSlide, bSlide;
let colorLayerData, outlineLayerData, clearLayerData;
let draws = {};

//Preset color array
let colors = [
  {r:253,g:225,b:226},{r:255,g:235,b:221},{r:255,g:253,b:213},{r:201,g:245,b:215},{r:193,g:224,b:255},{r:255,g:206,b:255},{r:255,g:255,b:255},{r:245,g:122,b:129},{r:255,g:179,b:128},{r:255,g:249,b:125},{r:119,g:230,b:155},{r:108,g:182,b:255},{r:255,g:113,b:255},{r:211,g:211,b:211},{r:255,g:0,b:0},{r:255,g:127,b:39},{r:255,g:242,b:0},{r:34,g:177,b:76},{r:0,g:128,b:255},{r:236,g:0,b:236},{r:151,g:151,b:151},{r:175,g:14,b:22},{r:185,g:74,b:0},{r:153,g:146,b:0},{r:21,g:111,b:48},{r:0,g:85,b:9170},{r:174,g:0,b:174}, {r:90,g:90,b:90},{r:95,g:7,b:12},{r:121,g:49,b:0},{r:96,g:91,b:0},{r:11,g:60,b:26},{r:0,g:9,b:98},{r:81,g:0,b:81},{r:0,g:0,b:0}
];

// FUNCTIONS
//Returns a string of an rgb color
//Takes: red, green, and blue values for a color
const colorToString = (r,g,b) =>{
  return "rgb("+ r + "," + g + "," + b +")";
};

let DEFAULT_FILL_STYLE = colorToString(255,0,0);

//Returns an object given an rgb string
const colorToObject = (color) => {
  let array = color.split(",");
  let r = parseInt(array[0].substring(array[0].indexOf("(") + 1));
  let g = parseInt(array[1]);
  let b = parseInt(array[2].substring(0,array[2].indexOf(")")));
  return {r:r,g:g,b:b};
}

//Draws the outlines of all the shapes in the template
const draw = () => {
  topCtx.globalAlpha = 1;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  if(colorLayerData){
    ctx.putImageData(colorLayerData,0,0);
  }
  
  let keys = Object.keys(draws);
  for(let i = 0; i < keys.length; i++){
    const drawCall = draws[keys[i]];
    topCtx.strokeStyle = drawCall.stroke;
    topCtx.lineWidth = drawCall.line;

    if(drawCall.shape === 'rect'){
      topCtx.strokeRect(drawCall.x,drawCall.y,drawCall.w,drawCall.h);      
    } else if(drawCall.shape === 'circle'){
      topCtx.beginPath();
      topCtx.arc(drawCall.x,drawCall.y,drawCall.rad,0,Math.PI * 2,false);
      topCtx.closePath();
      topCtx.stroke();
    } else if(drawCall.shape === 'line'){
      topCtx.beginPath();
      topCtx.moveTo(drawCall.x, drawCall.y);
      topCtx.lineTo(drawCall.x2, drawCall.y2);
      topCtx.stroke();
    }
    
    ctx.drawImage(topCavas,0,0);
    clearTopCanvas();    
  }
};

//Checks if the given r,g,b,a values match the outlines' color
const matchOutlineColor = (r,g,b,a) => {
  return (r + g + b === 0 && a === 255);
};

//Checks if the pixel at the given position matches the colors
//of the pixel which was clicked to start the flood fill
const matchStartColor = (pixelPos, startR, startG, startB) => {
  let r = outlineLayerData.data[pixelPos],
      g = outlineLayerData.data[pixelPos + 1],
      b = outlineLayerData.data[pixelPos + 2],
      a = outlineLayerData.data[pixelPos + 3];
  
  if(matchOutlineColor(r,g,b,a)){
    return false;
  }
  
  r = colorLayerData.data[pixelPos];
  g = colorLayerData.data[pixelPos + 1];
  b = colorLayerData.data[pixelPos + 2];
  
  if(r === startR && g=== startG && b === startB){
    return true;
  }
  
  if(r === colorToObject(fillStyle).r && g === colorToObject(fillStyle).g && b === colorToObject(fillStyle).b){
    return false;
  }
  return true;
};

//Colors in the pixel at the given position with the given r,g,b,a values
const colorPixel = (pixelPos,r,g,b,a) =>{
  colorLayerData.data[pixelPos] = r;
  colorLayerData.data[pixelPos + 1] = g;
  colorLayerData.data[pixelPos + 2] = b;
  colorLayerData.data[pixelPos + 3] = a !== undefined ? a:255;
};

//Colors all the pixels in a given area with the same color
const floodFill = (startX, startY, startR, startG, startB) => {
  let newPos, x,y,pixelPos,reachLeft,reachRight;
  let pixelStack = [[startX, startY]];
  let currentColor = colorToObject(fillStyle);
  
  while(pixelStack.length) {
    newPos = pixelStack.pop();
    x = newPos[0];
    y = newPos[1];
    
    pixelPos = ((y * canvas.width) + x) * 4;
    
    while(y >= 0 && matchStartColor(pixelPos, startR, startG, startB)){
      y-=1;
      pixelPos -= canvas.width * 4;
    }
    
    pixelPos += canvas.width * 4;
    y += 1;
    reachLeft = false;
    reachRight = false;
    
    while(y <= (canvas.height-1) && matchStartColor(pixelPos, startR, startG, startB)){
      y += 1;
      
      colorPixel(pixelPos, currentColor.r, currentColor.g, currentColor.b);
      
      if(x > 0){
        if(matchStartColor(pixelPos - 4, startR, startG, startB)){
          if(!reachLeft) {
            pixelStack.push([x-1,y]);
            reachLeft = true;
          }
        } else if(reachLeft){
            reachLeft = false;
        } 
      }
      
      if(x < (canvas.width-1)){
        if(matchStartColor(pixelPos + 4, startR, startG, startB)){
          if(!reachRight) {
            pixelStack.push([x+1,y]);
            reachRight = true;
          }
        } else if(reachRight){
            reachRight = false;
        } 
      }
      
      pixelPos += canvas.width * 4;
    }
  }
};


//Checks to make sure that flood fill should take place and then kicks it off
const paintAt = (startX, startY) => {
  let pixelPos = (startY * canvas.width + startX) * 4;
  let r = colorLayerData.data[pixelPos],
      g = colorLayerData.data[pixelPos + 1],
      b = colorLayerData.data[pixelPos + 2],
      a = colorLayerData.data[pixelPos + 3];  
  
  let currentColor = colorToObject(fillStyle);
  if(r === currentColor.r && g === currentColor.g && b === currentColor.b){
    return;
  }
  
  if(matchOutlineColor(r,g,b,a)){
    return;
  }
  
  floodFill(startX, startY, r, g, b);
  
  draw();
};

//Sets the background color of the color swatch to be the current values
//of the red, green, and blue sliders; Sets the fillstyle to be the current 
//values of the red, green, and blue sliders; Deactivates the current active color
const setSwatchFillActiveColor = () => {
  document.querySelector("#colorSwatch").style.backgroundColor = colorToString(rSlide.value, gSlide.value, bSlide.value);
  fillStyle = colorToString(rSlide.value, gSlide.value, bSlide.value);
  if(document.querySelector(".activeColor"))
    document.querySelector(".activeColor").classList.remove("activeColor");  
};

//Creates the preset color elements and their click events
const setColorEvents = () => {
  let colorTable = document.querySelector("#presets");
  let index = 0;
  
  for(let x = 0; x < 5; x++){
    const tr = document.createElement("tr");
    for(let y = 0; y < 7;y++){
      const color = colors[index];
      const element = document.createElement("td");
      
      element.height = 20;
      element.width = 20;      
      element.style.backgroundColor = colorToString(color.r, color.g, color.b);
      element.onclick = () => {
        rSlide.value = color.r;
        gSlide.value = color.g;
        bSlide.value = color.b;
        setSwatchFillActiveColor();
        element.classList.add("activeColor");
      };
      tr.append(element);
      index++;
    }
    colorTable.append(tr);
  }
  
  colorTable.children[0].children[0].classList.add("activeColor");
};

//Kicks off the paintAt function when user clicks
const doMousedown = (e) => {
  let mouse = getMouse(e);
  paintAt(mouse.x, mouse.y);
};

//Clears the top canvas
const clearTopCanvas = () => {
    topCtx.clearRect(0,0,topCtx.canvas.width,topCtx.canvas.height);
};

//gets the position of the pixel in the image data array at
//the given x,y coordinates
const getPixelPos = (x,y) => {
 return ((y * canvas.width) + x) * 4; 
};

//clears the colors from the drawing
const doClear = () => {
  colorLayerData.data.set(clearLayerData.data);
  draw();
};

//saves the drawing to the database
const doSave = () => {
  let modal = document.getElementById('saveModal');
  modal.style.display = "block";
  
  document.getElementById('cancelButton').onclick = () => {
    modal.style.display = "none";
  };
  
  document.getElementById('formSaveButton').onclick = (e) => {
    e.preventDefault();
    
    let imgData = canvas.toDataURL()
    
    let data = {
      dataString: imgData,
      _csrf: document.getElementById("csrf").value
    };
        
    $.ajax({
      cache: false,
      type: "POST",
      url: "/savePic",
      data: data,
      dataType: "json",
      success: (result, status, xhr) => {
        window.location = "/gallery";
      },
      error: (xhr, status, error) => {
        window.location = "/gallery";
      }
    });
    
    return false;
  };
};

// Author: Tony Jefferson
const getMouse = (e) =>{
    let mouse = {}
    mouse.x = e.pageX - e.target.offsetLeft;
    mouse.y = e.pageY - e.target.offsetTop;
    return mouse;
};

//Initialize variables, fills in the draws array
const init = () => {
    // initialize some globals
    canvas = document.querySelector('#mainCanvas');
    ctx = canvas.getContext('2d');
    fillStyle = DEFAULT_FILL_STYLE;
    origin = {}; // empty object
    topCavas = document.querySelector('#topCavas');
    topCtx = topCavas.getContext('2d');
  
    topCtx.fillStyle = ctx.fillStyle= fillStyle;
  
    // Hook up event listeners
    topCavas.onmousedown = doMousedown;
    
    colorLayerData = ctx.getImageData(0,0,canvas.width,canvas.height);
    clearLayerData = ctx.getImageData(0,0,canvas.width,canvas.height);
  
    let drawsArray = document.getElementById("calls").children;
    if(drawsArray.length > 0){
      draws = {};
      for(let i = 0; i < drawsArray.length; i++){
        draws[i] = {};
        draws[i]["shape"] = drawsArray[i].children[0].innerHTML;
        draws[i]["x"] = parseInt(drawsArray[i].children[1].innerHTML);
        draws[i]["y"] = parseInt(drawsArray[i].children[2].innerHTML);    
        draws[i]["line"] = parseInt(drawsArray[i].children[8].innerHTML);
        draws[i]["fill"] = "white";
        if(draws[i]["shape"] === "rect"){
          draws[i]["w"] = parseInt(drawsArray[i].children[3].innerHTML);
          draws[i]["h"] = parseInt(drawsArray[i].children[4].innerHTML);        
        } else if(draws[i]["shape"] === "circle"){
          draws[i]["rad"] = parseInt(drawsArray[i].children[5].innerHTML);
        } else{
          draws[i]["x2"] = drawsArray[i].children[6].innerHTML;
          draws[i]["y2"] = drawsArray[i].children[7].innerHTML;    
        }
      }
    }
  
    draw();
  
    if(Object.keys(draws).length === 0){
      $("#fillAlert").css("display","block");
      $("#fillAlert").css("z-index","1");
      $("#fillAlert").css("position","relative");   
    }
    
    outlineLayerData = ctx.getImageData(0,0,canvas.width,canvas.height);  
  
    document.querySelector("#clearButton").onclick = function(){
      doClear();
    };
    document.querySelector("#savebutton").onclick = doSave;
  
    rSlide = document.querySelector("#rSlide");
    gSlide = document.querySelector("#gSlide");
    bSlide = document.querySelector("#bSlide");
  
    setSwatchFillActiveColor();
  
    rSlide.oninput = () =>{
      document.querySelector("#rLabel").innerHTML = "R: " +
        rSlide.value;
        setSwatchFillActiveColor();
    }
    gSlide.oninput = () =>{
      document.querySelector("#gLabel").innerHTML = "G: " +
        gSlide.value;
        setSwatchFillActiveColor();
    }
    bSlide.oninput = () =>{
      document.querySelector("#bLabel").innerHTML = "B: " +
        bSlide.value;
        setSwatchFillActiveColor();
    }    
    
    setColorEvents();
};

window.onload = init;