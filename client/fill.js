"use strict";
window.onload = init;

// GLOBALS
var canvas,ctx,dragging=false,lineWidth,strokeStyle;
var currentTool, fillStyle, origin, topCavas, topCtx;
var rectX,rectY,rectW,rectH,circX,circY,circRad;

// CONSTANTS
var DEFAULT_FILL_STYLE = "blue";

//Default draws
var draws = {
//  3:{shape:'rect',x:190,y:202,w:290,h:97,fill:'white',stroke:'red', line:3},
//  2:{shape:'rect',x:150,y:170,w:370,h:160,fill:'white',stroke:'orange', line:3},
//  1:{shape:'rect',x:122,y:150,w:428,h:201,fill:'white',stroke:'yellow', line:3},
//  4:{shape:'rect',x:231,y:230,w:209,h:40,fill:'white',stroke:'green', line:3},
};

// FUNCTIONS
const draw = () => {
  topCtx.globalAlpha = 1;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  var keys = Object.keys(draws);
  
  for(var i = 0; i < keys.length; i++){
    const drawCall = draws[keys[i]];
    topCtx.strokeStyle = drawCall.stroke;
    topCtx.lineWidth = drawCall.line;
    
    if(drawCall.fill != "none"){
      topCtx.fillStyle = drawCall.fill;
      topCtx.fillRect(drawCall.x,drawCall.y,drawCall.w,drawCall.h);
    }
    
    if(drawCall.shape === 'rect'){
      topCtx.strokeRect(drawCall.x,drawCall.y,drawCall.w,drawCall.h);      
    } else if(drawCall.shape === 'circle'){
      topCtx.beginPath();
      topCtx.arc(drawCall.x,drawCall.y,drawCall.rad,0,Math.PI * 2,false);
      topCtx.closePath();
      topCtx.fill();
      topCtx.stroke();
    }
    
    ctx.drawImage(topCavas,0,0);
    clearTopCanvas();    
  }
}

const inShape = (mouse) => {
  var keys = Object.keys(draws);
  var shapes = [];
  for(var i = 0; i < keys.length; i++){
    const shape = draws[keys[i]];
    if(shape.shape === 'rect'){
      if(mouse.x > shape.x && mouse.x < (shape.x + shape.w)){
        if(mouse.y > shape.y && mouse.y < (shape.y + shape.h)){
          shapes.push(draws[keys[i]]);
        }
      } 
    } else if(shape.shape === 'circle'){
      var distance = Math.sqrt(Math.pow((mouse.x - shape.x),2) + Math.pow((mouse.y - shape.y),2));
      if(distance < shape.rad){
        shapes.push(draws[keys[i]]);
      }
    }
  }
  return shapes;
}

const smallestArea = (shapes) => {
  var smallest = shapes[0];
  for(var i = 1; i < shapes.length; i++){
    if(shapes[i].shape === "rect"){
      if(smallest.shape === "rect"){
        if((smallest.w * smallest.h) > (shapes[i].w * shapes[i].h)){
          smallest = shapes[i];
        }
      } else if(smallest.shape == "circle"){
        if((Math.PI * Math.pow(smallest.rad,2)) > (shapes[i].w * shapes[i].h)){
          smallest = shapes[i];
        }
      }
    } else if(shapes[i].shape === "circle"){
      if(smallest.shape === "circle"){
        if((Math.PI * Math.pow(smallest.rad,2)) > (Math.PI * Math.pow(shapes[i].rad,2))){
          smallest = shapes[i];
        }
      } else if(smallest.shape === "rect"){
        if((smallest.w * smallest.h) > (Math.PI * Math.pow(shapes[i].rad,2))){
          smallest = shapes[i];
        }
      }      
    }
  }
  return smallest;
}

const setColorEvents = () => {
  document.querySelector('#Blue').style.backgroundColor = "Blue";
  document.querySelector('#Blue').onclick = function(e){fillStyle = e.target.id;};
  document.querySelector('#Red').style.backgroundColor = "Red";
  document.querySelector('#Red').onclick = function(e){fillStyle = e.target.id;};
  document.querySelector('#Orange').style.backgroundColor = "Orange";
  document.querySelector('#Orange').onclick = function(e){fillStyle = e.target.id;};
  document.querySelector('#Yellow').style.backgroundColor = "Yellow";
  document.querySelector('#Yellow').onclick = function(e){fillStyle = e.target.id;};
  document.querySelector('#Green').style.backgroundColor = "Green";
  document.querySelector('#Green').onclick = function(e){fillStyle = e.target.id;};
  document.querySelector('#BlueViolet').style.backgroundColor = "BlueViolet";
  document.querySelector('#BlueViolet').onclick = function(e){fillStyle = e.target.id;};
  document.querySelector('#HotPink').style.backgroundColor = "HotPink";
  document.querySelector('#HotPink').onclick = function(e){fillStyle = e.target.id;};
  document.querySelector('#Black').style.backgroundColor = "Black";
  document.querySelector('#Black').onclick = function(e){fillStyle = e.target.id;};
  document.querySelector('#White').style.backgroundColor = "White";
  document.querySelector('#White').onclick = function(e){fillStyle = e.target.id;};
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
    draw();
  
    if(Object.keys(draws).length === 0){
      $("#fillAlert").css("display","block");
      $("#fillAlert").css("z-index","1");
      $("#fillAlert").css("position","relative");   
    }
    

    setColorEvents();

    document.querySelector("#clearButton").onclick = function(){
      doClear();
    };
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
    var shapes = inShape(getMouse(e));
    if(shapes.length == 0){
      canvas.style.background = fillStyle;
    }else if(shapes.length == 1){
      shapes[0].fill = fillStyle;
    }else if(shapes.length > 1){
      var shape = smallestArea(shapes);
      console.log(shape);
      shape.fill = fillStyle;
    }	
    draw();
}

function clearTopCanvas () {
    topCtx.clearRect(0,0,topCtx.canvas.width,topCtx.canvas.height);
}

function doClear(){
  var keys = Object.keys(draws);
  
  for(var i = 0; i < keys.length; i++){
    const drawCall = draws[keys[i]];
    drawCall.fill = "white";
  }
  
  canvas.style.background = "white";
  draw();
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


// UTILITY FUNCTIONS
/*
These utility functions do not depend on any global variables being in existence, 
and produce no "side effects" such as changing ctx state variables.
They are "pure functions" - see: http://en.wikipedia.org/wiki/Pure_function
*/

// Function Name: getMouse()
// returns mouse position in local coordinate system of element
// Author: Tony Jefferson
// Last update: 3/1/2014
function getMouse(e){
    var mouse = {}
    mouse.x = e.pageX - e.target.offsetLeft;
    mouse.y = e.pageY - e.target.offsetTop;
    return mouse;
}