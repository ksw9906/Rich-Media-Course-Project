"use strict";
window.onload = init;

// GLOBALS
var canvas,ctx,dragging=false,lineWidth,strokeStyle;
var currentTool, fillStyle, origin, topCavas, topCtx;
var rectX,rectY,rectW,rectH,circX,circY,circRad;

// CONSTANTS
var DEFAULT_LINE_WIDTH = 3;
var DEFAULT_STROKE_STYLE = "Black";
var TOOL_RECTANGLE = "toolRectangle";
var TOOL_CIRCLE = "toolCircle";

var draws = [];

// FUNCTIONS
const draw = () => {
  topCtx.globalAlpha = 1;
  doClear();
  
  for(var i = 0; i < draws.length; i++){
    const drawCall = draws[i];
    topCtx.strokeStyle = drawCall.stroke;
    topCtx.lineWidth = drawCall.line;
    
    if(drawCall.shape === 'rect'){
      topCtx.strokeRect(drawCall.x,drawCall.y,drawCall.w,drawCall.h); 
    } else if(drawCall.shape === 'circle'){
      topCtx.beginPath();
      topCtx.arc(drawCall.x,drawCall.y,drawCall.rad,0,Math.PI * 2,false);
      topCtx.closePath();
      topCtx.stroke();
    }

    ctx.drawImage(topCavas,0,0);
    clearTopCanvas();    
  }
  console.log(draws);
};

// FUNCTIONS
function init(){
    // initialize some globals
    canvas = document.querySelector('#mainCanvas');
    ctx = canvas.getContext('2d');
    lineWidth = DEFAULT_LINE_WIDTH;
    strokeStyle = DEFAULT_STROKE_STYLE;
    currentTool = TOOL_RECTANGLE;
    origin = {}; // empty object
    topCavas = document.querySelector('#topCavas');
    topCtx = topCavas.getContext('2d');

    // set initial properties of the graphics context 
    topCtx.lineWidth = ctx.lineWidth = lineWidth;
    topCtx.strokeStyle = ctx.strokeStyle = strokeStyle;
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
    
//    setColorEvents();

    document.querySelector('#toolChooser').onchange = function(e){
        currentTool = e.target.value;
        console.log("currentTool=" + currentTool);
    }

    document.querySelector("#clearButton").onclick = function(){
      draws = [];
      doClear();
    };
    document.querySelector("#saveButton").onclick = doSave;
    document.querySelector("#undoButton").onclick = function(){
      draws.pop();
      draw();
    }
}


// EVENT CALLBACK FUNCTIONS
function doMousedown(e){
    dragging = true;
    var mouse = getMouse(e);

    switch(currentTool){
        case TOOL_RECTANGLE:
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
            topCtx.lineWidth = lineWidth;

            clearTopCanvas();
            topCtx.globalAlpha = 0.3;

            topCtx.strokeRect(rectX,rectY,rectW,rectH);
            break;

        case TOOL_CIRCLE:
            circX = Math.min(mouse.x,origin.x);
            circY = Math.min(mouse.y,origin.y);
            var circW = Math.abs(mouse.x - origin.x);
            var circH = Math.abs(mouse.y - origin.y);
            circRad = Math.sqrt((circW * circW) + (circH * circH)); 

            topCtx.strokeStyle = strokeStyle;
            topCtx.lineWidth = lineWidth;

            clearTopCanvas();
            topCtx.globalAlpha = 0.3;

            topCtx.beginPath();
            topCtx.arc(origin.x,origin.y,circRad,0,Math.PI * 2,false);
            topCtx.closePath();
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
            draws[draws.length] = {shape:'rect', x:rectX, y:rectY, w:rectW, h:rectH, stroke: strokeStyle, line: lineWidth};
            draw();
            break;
        case TOOL_CIRCLE:
            if(dragging){
                ctx.drawImage(topCavas,0,0);
                clearTopCanvas();
            }
            draws[draws.length] = {shape:'circle', x:origin.x, y:origin.y, rad:circRad, stroke: strokeStyle, line: lineWidth};
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

function doSave(){
  var modal = document.getElementById('saveModal');
  modal.style.display = "block";
  
  document.getElementById('cancelButton').onclick = () => {
    modal.style.display = "none";
  };
  
  document.getElementById('formSaveButton').onclick = (e) => {
    e.preventDefault();
    
    var data = {
      name: document.getElementById("templateName").value,
      _csrf: document.getElementById("csrf").value,
      calls: draws,
    };
    
    console.log(data);
    
    $.ajax({
      cache: false,
      type: "POST",
      url: "/save",
      data: data,
      dataType: "json",
      success: (result, status, xhr) => {
        console.log("success");
        window.location = result.redirect;
      },
      error: (xhr, status, error) => {
          const messageObj = JSON.parse(xhr.responseText);
          console.log(messageObj.error);
      }
    });
    
    return false;
  };
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