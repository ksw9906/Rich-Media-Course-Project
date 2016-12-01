"use strict";
window.onload = init;

// GLOBALS
var canvas,ctx,dragging=false,lineWidth,strokeStyle;
var currentTool, fillStyle, origin, topCavas, topCtx;
var rectX,rectY,rectW,rectH,circX,circY,circRad;

// CONSTANTS
var DEFAULT_LINE_WIDTH = 3;
var DEFAULT_STROKE_STYLE = "red";
//var DEFAULT_FILL_STYLE = "blue";
var TOOL_RECTANGLE = "toolRectangle";
var TOOL_CIRCLE = "toolCircle";

var draws = {};

// FUNCTIONS
const draw = () => {
  topCtx.globalAlpha = 1;
  doClear();
  var keys = Object.keys(draws);
  
  for(var i = 0; i < keys.length; i++){
    const drawCall = draws[keys[i]];
    topCtx.strokeStyle = drawCall.stroke;
    topCtx.lineWidth = drawCall.line;
    
//    if(drawCall.fill != "none"){
//      topCtx.fillStyle = drawCall.fill;
//      topCtx.fillRect(drawCall.x,drawCall.y,draw.w,draw.h);
//    }
    
    if(drawCall.shape === 'rect'){
      topCtx.strokeRect(drawCall.x,drawCall.y,drawCall.w,drawCall.h);      
    } else if(drawCall.shape === 'circle'){
      topCtx.beginPath();
      topCtx.arc(drawCall.x,drawCall.y,drawCall.rad,0,Math.PI * 2,false);
      topCtx.closePath();
//      topCtx.fill();
      topCtx.stroke();
    }

    ctx.drawImage(topCavas,0,0);
    clearTopCanvas();    
  }
  console.log(draws);
}

const setColorEvents = () => {
  document.querySelector('#Blue').style.backgroundColor = "Blue";
  document.querySelector('#Blue').onclick = function(e){strokeStyle = e.target.id;};
  document.querySelector('#Red').style.backgroundColor = "Red";
  document.querySelector('#Red').onclick = function(e){strokeStyle = e.target.id;};
  document.querySelector('#Orange').style.backgroundColor = "Orange";
  document.querySelector('#Orange').onclick = function(e){strokeStyle = e.target.id;};
  document.querySelector('#Yellow').style.backgroundColor = "Yellow";
  document.querySelector('#Yellow').onclick = function(e){strokeStyle = e.target.id;};
  document.querySelector('#Green').style.backgroundColor = "Green";
  document.querySelector('#Green').onclick = function(e){strokeStyle = e.target.id;};
  document.querySelector('#BlueViolet').style.backgroundColor = "BlueViolet";
  document.querySelector('#BlueViolet').onclick = function(e){strokeStyle = e.target.id;};
  document.querySelector('#HotPink').style.backgroundColor = "HotPink";
  document.querySelector('#HotPink').onclick = function(e){strokeStyle = e.target.id;};
  document.querySelector('#Black').style.backgroundColor = "Black";
  document.querySelector('#Black').onclick = function(e){strokeStyle = e.target.id;};
  document.querySelector('#White').style.backgroundColor = "White";
  document.querySelector('#White').onclick = function(e){strokeStyle = e.target.id;};
}

// FUNCTIONS
function init(){
    // initialize some globals
    canvas = document.querySelector('#mainCanvas');
    ctx = canvas.getContext('2d');
    lineWidth = DEFAULT_LINE_WIDTH;
    strokeStyle = DEFAULT_STROKE_STYLE;
//    fillStyle = DEFAULT_FILL_STYLE;
    currentTool = TOOL_RECTANGLE;
    origin = {}; // empty object
    topCavas = document.querySelector('#topCavas');
    topCtx = topCavas.getContext('2d');

    // set initial properties of the graphics context 
    topCtx.lineWidth = ctx.lineWidth = lineWidth;
    topCtx.strokeStyle = ctx.strokeStyle = strokeStyle;
//    topCtx.fillStyle = ctx.fillStyle= fillStyle;
    topCtx.lineCap = ctx.lineCap = "round"; // "butt", "round", "square" (default "butt")
    topCtx.lineJoin = ctx.lineJoin = "round"; // "round", "bevel", "miter" (default "miter")


    drawGrid(ctx,'lightgray',10,10);

    // Hook up event listeners
    topCavas.onmousedown = doMousedown;
    topCavas.onmousemove = doMousemove;
    topCavas.onmouseup = doMouseup;
    topCavas.onmouseout = doMouseout;

    document.querySelector('#lineWidthChooser').onchange = doLineWidthChange;

    function doLineWidthChange (e) {
        lineWidth = e.target.value;
    }

//    document.querySelector('#strokeStyleChooser').onchange = doStrokeStyleChange;
//
//    function doStrokeStyleChange (e) {
//        strokeStyle = e.target.value;
//    }
    
    setColorEvents();

    document.querySelector('#toolChooser').onchange = function(e){
        currentTool = e.target.value;
        console.log("currentTool=" + currentTool);
    }

    document.querySelector("#clearButton").onclick = function(){
      draws = {};
      doClear();
    };
    document.querySelector("#exportButton").onclick = doExport;
    document.querySelector("#undoButton").onclick = function(){
      var keys = Object.keys(draws);
      if(keys.length > 0){
        delete draws[keys[keys.length-1]];
        draw();
      }
    }
}


// EVENT CALLBACK FUNCTIONS
function doMousedown(e){
    dragging = true;
    var mouse = getMouse(e);

    switch(currentTool){
//        case TOOL_PENCIL:
//            ctx.beginPath();
//            ctx.moveTo(mouse.x, mouse.y);
//            break;
        case TOOL_RECTANGLE:
//        case TOOL_LINE:
            origin.x = mouse.x;
            origin.y = mouse.y;
            break;
        case TOOL_CIRCLE:
            origin.x = mouse.x;
            origin.y = mouse.y;
            break;
    }		
}

function doMousemove(e) {
    // bail out if the mouse button is not down
    if(! dragging) return;

    // get location of mouse in canvas coordiates
    var mouse =  getMouse(e);

    switch(currentTool)
    {
        case TOOL_RECTANGLE:
            rectX = Math.min(mouse.x,origin.x);
            rectY = Math.min(mouse.y,origin.y);
            rectW = Math.abs(mouse.x - origin.x);
            rectH = Math.abs(mouse.y - origin.y);

            topCtx.strokeStyle = strokeStyle;
//            topCtx.fillStyle = fillStyle;
            topCtx.lineWidth = lineWidth;

            clearTopCanvas();
            topCtx.globalAlpha = 0.3;

//            topCtx.fillRect(rectX,rectY,rectW,rectH);
            topCtx.strokeRect(rectX,rectY,rectW,rectH);
            break;

        case TOOL_CIRCLE:
            circX = Math.min(mouse.x,origin.x);
            circY = Math.min(mouse.y,origin.y);
            var circW = Math.abs(mouse.x - origin.x);
            var circH = Math.abs(mouse.y - origin.y);
            circRad = Math.sqrt((circW * circW) + (circH * circH)); 

            topCtx.strokeStyle = strokeStyle;
//            topCtx.fillStyle = fillStyle;
            topCtx.lineWidth = lineWidth;

            clearTopCanvas();
            topCtx.globalAlpha = 0.3;

            topCtx.beginPath();
            topCtx.arc(origin.x,origin.y,circRad,0,Math.PI * 2,false);
            topCtx.closePath();
//            topCtx.fill();
            topCtx.stroke();

            break;
    }

}

function doMouseup(e) {
    switch(currentTool){
        case TOOL_RECTANGLE:
            if(dragging){
                ctx.drawImage(topCavas,0,0);
                clearTopCanvas();
            }
            draws[Date.now()] = {shape:'rect', x:rectX, y:rectY, w:rectW, h:rectH, stroke: strokeStyle, line: lineWidth};
            draw();
            break;
        case TOOL_CIRCLE:
            if(dragging){
                ctx.drawImage(topCavas,0,0);
                clearTopCanvas();
            }
            draws[Date.now()] = {shape:'circle', x:origin.x, y:origin.y, rad:circRad, stroke: strokeStyle, line: lineWidth};
            draw();
            break;
    }

    dragging = false;
}

// if the user drags out of the canvas
function doMouseout(e) {
    switch(currentTool){
        case TOOL_RECTANGLE:
            clearTopCanvas();
            break;
    }
    dragging = false;
}

function clearTopCanvas () {
    topCtx.clearRect(0,0,topCtx.canvas.width,topCtx.canvas.height);
}

function doClear(){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawGrid(ctx,'lightgray', 10, 10);
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

/*
Function Name: drawGrid()
Description: Fills the entire canvas with a grid
Last update: 9/1/2014
*/
function drawGrid(ctx, color, cellWidth, cellHeight){
    // save the current drawing state as it existed before this function was called
    ctx.save()

    // set some drawing state variables
    ctx.strokeStyle = color;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // vertical lines all set!
    for (var x = cellWidth + 0.5; x < ctx.canvas.width; x += cellWidth) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
    }

    /*
        Need horizontal lines!
        You write it!
    */
    for (var y = cellHeight + 0.5; y < ctx.canvas.height; y += cellHeight) {
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(ctx.canvas.width,y);
        ctx.stroke();
    };


    // restore the drawing state
    ctx.restore();
}