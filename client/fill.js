"use strict";
window.onload = init;

// GLOBALS
var canvas,ctx,dragging=false,lineWidth,strokeStyle;
var currentTool, fillStyle, origin, topCavas, topCtx;
var rectX,rectY,rectW,rectH,circX,circY,circRad;

//Fill code: https://github.com/williammalone/HTML5-Paint-Bucket-Tool/blob/master/html5-canvas-paint-bucket.js
var colors =
    {
      red:{r:255, g:0, b:0},
      orange:{r:255, g:191, b:0},
      yellow:{r:255, g:255, b:0},
      green:{r:0, g:153, b:38},
      blue:{r:0, g:0, b:255},
      purple:{r:191, g:0, b:255},
      pink:{r:255, g:102, b:179},
      white:{r:255, g:255, b:255}
    }


var colorToString = (r,g,b) =>{
  return "rgb("+ r + "," + g + "," + b +")";
};

var colorToObject = (color) => {
  var array = color.split(",");
  var r = parseInt(array[0].substring(array[0].indexOf("(") + 1));
  var g = parseInt(array[1]);
  var b = parseInt(array[2].substring(0,array[2].indexOf(")")));
  return {r:r,g:g,b:b};
}

var colorLayerData, outlineLayerData;

// CONSTANTS
var DEFAULT_FILL_STYLE = colorToString(colors.red.r, colors.red.g, colors.red.b);

//Default draws
var draws = {};

// FUNCTIONS
const draw = (clearing) => {
  topCtx.globalAlpha = 1;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  if(colorLayerData){
    ctx.putImageData(colorLayerData,0,0);
  }
  
  var keys = Object.keys(draws);
  
  for(var i = 0; i < keys.length; i++){
    const drawCall = draws[keys[i]];
    topCtx.strokeStyle = drawCall.stroke;
    topCtx.lineWidth = drawCall.line;
    
    if(drawCall.fill != "none"){
      topCtx.fillStyle = drawCall.fill;
      if(clearing){
        topCtx.fillRect(drawCall.x,drawCall.y,drawCall.w,drawCall.h);
      }
    }
    
    if(drawCall.shape === 'rect'){
      topCtx.strokeRect(drawCall.x,drawCall.y,drawCall.w,drawCall.h);      
    } else if(drawCall.shape === 'circle'){
      topCtx.beginPath();
      topCtx.arc(drawCall.x,drawCall.y,drawCall.rad,0,Math.PI * 2,false);
      topCtx.closePath();
      if(clearing){
        topCtx.fill();        
      }

      topCtx.stroke();
    }
    
    ctx.drawImage(topCavas,0,0);
    clearTopCanvas();    
  }
};

const matchOutlineColor = (r,g,b,a) => {
  return (r + g + b === 0 && a === 255);
};

const matchStartColor = (pixelPos, startR, startG, startB) => {
  var r = outlineLayerData.data[pixelPos],
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

const colorPixel = (pixelPos,r,g,b,a) =>{
  colorLayerData.data[pixelPos] = r;
  colorLayerData.data[pixelPos + 1] = g;
  colorLayerData.data[pixelPos + 2] = b;
  colorLayerData.data[pixelPos + 3] = a !== undefined ? a:255;
};

const floodFill = (startX, startY, startR, startG, startB) => {
  var newPos, x,y,pixelPos,reachLeft,reachRight;
  var pixelStack = [[startX, startY]];
  var currentColor = colorToObject(fillStyle);
  
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

const paintAt = (startX, startY) => {
  var pixelPos = (startY * canvas.width + startX) * 4;
  var r = colorLayerData.data[pixelPos],
      g = colorLayerData.data[pixelPos + 1],
      b = colorLayerData.data[pixelPos + 2],
      a = colorLayerData.data[pixelPos + 3];  
  
  var currentColor = colorToObject(fillStyle);
  if(r === currentColor.r && g === currentColor.g && b === currentColor.b){
    return;
  }
  
  if(matchOutlineColor(r,g,b,a)){
    return;
  }
  
  floodFill(startX, startY, r, g, b);
  
  draw(false);
};

const setColorEvents = () => {
  var colorElements = document.querySelector("#colors").children;
  var keys = Object.keys(colors);
  
  for(var i = 0; i < keys.length; i++){
    const color = colors[keys[i]];
    const element = colorElements[i];
    const colorString = colorToString(color.r,color.g,color.b);
    element.style.backgroundColor = colorString;
    element.onclick = function(){
      document.querySelector(".activeColor").classList.remove("activeColor");
      fillStyle = colorString;
      element.classList.add("activeColor");
    };
  }
  colorElements[0].classList.add("activeColor");
}

// FUNCTIONS
function init(){
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
  
    var drawsArray = document.getElementById("calls").children;
    if(drawsArray.length > 0){
      draws = {};
      for(var i = 0; i < drawsArray.length; i++){
        draws[i] = {};
        draws[i]["shape"] = drawsArray[i].children[0].innerHTML;
        draws[i]["x"] = parseInt(drawsArray[i].children[1].innerHTML);
        draws[i]["y"] = parseInt(drawsArray[i].children[2].innerHTML);
        draws[i]["stroke"] = drawsArray[i].children[6].innerHTML;
        draws[i]["line"] = parseInt(drawsArray[i].children[7].innerHTML);
        draws[i]["fill"] = "white";
        if(draws[i]["shape"] === "rect"){
          draws[i]["w"] = parseInt(drawsArray[i].children[3].innerHTML);
          draws[i]["h"] = parseInt(drawsArray[i].children[4].innerHTML);        
        } else{
          draws[i]["rad"] = parseInt(drawsArray[i].children[5].innerHTML);
        }
      }
    }
    draw(false);
  
    if(Object.keys(draws).length === 0){
      $("#fillAlert").css("display","block");
      $("#fillAlert").css("z-index","1");
      $("#fillAlert").css("position","relative");   
    }

    setColorEvents();
    
    outlineLayerData = ctx.getImageData(0,0,canvas.width,canvas.height);  
  
//    document.querySelector("#clearButton").onclick = function(){
//      doClear();
//    };
    document.querySelector("#exportButton").onclick = doExport;
//    document.querySelector("#undoButton").onclick = function(){
//      var keys = Object.keys(draws);
//      if(keys.length > 0){
//        delete draws[keys[keys.length-1]];
//        draw();
//      }
//    }
}


// EVENT CALLBACK FUNCTIONS
function doMousedown(e){
  var mouse = getMouse(e);
  paintAt(mouse.x, mouse.y);
}

function clearTopCanvas () {
    topCtx.clearRect(0,0,topCtx.canvas.width,topCtx.canvas.height);
}

function getPixelPos(x,y){
 return ((y * canvas.width) + x) * 4; 
}

function doClear(){
//  var pixelPos = getPixelPos(0,0);
//  var r = outlineLayerData.data[pixelPos],
//      g = outlineLayerData.data[pixelPos + 1],
//      b = outlineLayerData.data[pixelPos + 2];
//  
//  var saveFill = fillStyle;
//  fillStyle = colorToString(white.r, white.g, white.b);
//  
//  for(var x = 0; x < canvas.width; x++){
//    for(var y = 0; y < canvas.height; y++){
//      r = outlineLayerData.data[getPixelPos(x,y)];
//      g = outlineLayerData.data[getPixelPos(x,y) + 1];
//      b = outlineLayerData.data[getPixelPos(x,y) + 2];
//      
//      if(r != 255 || g != 255 || b != 255){
//        paintAt(x,y);
//      }
//    }
//  }
//  
//  fillStyle = saveFill;
}

function doExport(){
    // open a new window and load the image in it
    // http://www.w3schools.com/jsref/met_win_open.asp
    var data = canvas.toDataURL(); 
    var windowName = "canvasImage";
    var windowOptions = "left=0,top=0,width=" + canvas.width + ",height=" + canvas.height +",toolbar=0,resizable=0";
    var myWindow = window.open(data,windowName,windowOptions);
    myWindow.resizeTo(canvas.width,canvas.height); // needed so Chrome would display image
 }

// Author: Tony Jefferson
function getMouse(e){
    var mouse = {}
    mouse.x = e.pageX - e.target.offsetLeft;
    mouse.y = e.pageY - e.target.offsetTop;
    return mouse;
}