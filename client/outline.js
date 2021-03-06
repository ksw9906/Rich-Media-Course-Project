"use strict";
// VARIABLES
let canvas,ctx,dragging=false,lineWidth,strokeStyle;
let currentTool, fillStyle, origin, topCavas, topCtx;
let rectX,rectY,rectW,rectH,circX,circY,circRad;
// CONSTANTS
let DEFAULT_LINE_WIDTH = 3;
let DEFAULT_STROKE_STYLE = "Black";
let TOOL_RECTANGLE = "toolRectangle";
let TOOL_CIRCLE = "toolCircle";
let TOOL_LINE = "toolLine";
let draws = [];

// FUNCTIONS

//Draws the shapes drawn by the user
const draw = () => {
  topCtx.globalAlpha = 1;
  doClear();
  
  for(let i = 0; i < draws.length; i++){
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

// EVENT CALLBACK FUNCTIONS
//starts creating the shape when user clicks
const doMousedown = (e) => {
    dragging = true;
    let mouse = getMouse(e);

    switch(currentTool){
        case TOOL_RECTANGLE:
        case TOOL_LINE:
            origin.x = mouse.x;
            origin.y = mouse.y;
            break;        
        case TOOL_CIRCLE:
            origin.x = mouse.x;
            origin.y = mouse.y;
            break;
    }		
};

//tracks the size and position of the current shape as the
//user moves the mouse
const doMousemove = (e) => {
    // bail out if the mouse button is not down
    if(! dragging) return;

    // get location of mouse in canvas coordiates
    let mouse =  getMouse(e);

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
        
        case TOOL_LINE:
            topCtx.strokeStyle = strokeStyle;
            topCtx.lineWidth = lineWidth;

            topCtx.beginPath();
            topCtx.moveTo(origin.x, origin.y);
            topCtx.lineTo(mouse.x, mouse.y);

            clearTopCanvas();

            topCtx.stroke();
            break;

        case TOOL_CIRCLE:
            circX = Math.min(mouse.x,origin.x);
            circY = Math.min(mouse.y,origin.y);
            let circW = Math.abs(mouse.x - origin.x);
            let circH = Math.abs(mouse.y - origin.y);
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
};

//Adds the current shape to the draws array
const doMouseup = (e) => {
    switch(currentTool){
      case TOOL_RECTANGLE:
        if(dragging){
            ctx.drawImage(topCavas,0,0);
            clearTopCanvas();
        }
        draws[draws.length] = {shape:'rect', x:rectX, y:rectY, w:rectW, h:rectH, line: lineWidth};
        draw();
        break;
      case TOOL_LINE:
        let mouse = getMouse(e);
        if(dragging){
          ctx.drawImage(topCavas,0,0);
          clearTopCanvas();
        }
        draws[draws.length] = {shape:'line', x:origin.x, y:origin.y, x2:mouse.x, y2: mouse.y, line: lineWidth};
        draw();
        break;
      case TOOL_CIRCLE:
        if(dragging){
          ctx.drawImage(topCavas,0,0);
          clearTopCanvas();
        }
        draws[draws.length] = {shape:'circle', x:origin.x, y:origin.y, rad:circRad,  line: lineWidth};
        draw();
        break;
    }

    dragging = false;
};

//cancels out the current shape if the user drags out of the canvas
const doMouseout = (e) => {
    switch(currentTool){
        case TOOL_RECTANGLE:
            clearTopCanvas();
            break;
    }
    dragging = false;
};

//Clears the top canvas
const clearTopCanvas = () => {
    topCtx.clearRect(0,0,topCtx.canvas.width,topCtx.canvas.height);
};

//clears the bottom canvas
const doClear = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawGrid(ctx,'lightgray', 10, 10);
};

//saves the template to the database
const doSave = () => {
  
  if(draws.length > 0){
    let modal = document.getElementById('saveModal');
    modal.style.display = "block";

    document.getElementById('cancelButton').onclick = () => {
      modal.style.display = "none";
    };

    document.getElementById('formSaveButton').onclick = (e) => {
      e.preventDefault();

      let data = {
        _csrf: document.getElementById("csrf").value,
        calls: draws,
      };

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
  } else {
    let modal = document.getElementById('alertModal');
    modal.style.display = "block";

    document.getElementById('cancelAlert').onclick = () => {
      modal.style.display = "none";
    };
  }
 };


// UTILITY FUNCTIONS
// returns mouse position in local coordinate system of element
// Author: Tony Jefferson
const getMouse = (e) => {
    let mouse = {}
    mouse.x = e.pageX - e.target.offsetLeft;
    mouse.y = e.pageY - e.target.offsetTop;
    return mouse;
};

//Function Name: drawGrid()
//Description: Fills the entire canvas with a grid
const drawGrid = (ctx, color, cellWidth, cellHeight) =>{
    // save the current drawing state as it existed before this function was called
    ctx.save()

    // set some drawing state variables
    ctx.strokeStyle = color;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // vertical lines all set!
    for (let x = cellWidth + 0.5; x < ctx.canvas.width; x += cellWidth) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
    }

    /*
        Need horizontal lines!
        You write it!
    */
    for (let y = cellHeight + 0.5; y < ctx.canvas.height; y += cellHeight) {
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(ctx.canvas.width,y);
        ctx.stroke();
    };


    // restore the drawing state
    ctx.restore();
};

//Initializes variablesand sets up click events
const init = () => {
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

    document.getElementById("plus").onclick = () => {
      if(lineWidth < 10){
        lineWidth++;
        document.getElementById("lineWidth").innerHTML = lineWidth;
      }
    };
    
    document.getElementById("minus").onclick = () => {
      if(lineWidth > 0){
        lineWidth--;
        document.getElementById("lineWidth").innerHTML = lineWidth;
      }
    };

    document.querySelector('#toolChooser').onchange = function(e){
        currentTool = e.target.value;
    };

    document.querySelector("#clearButton").onclick = function(){
      draws = [];
      doClear();
    };
    
    document.querySelector("#saveButton").onclick = doSave;
    
    document.querySelector("#undoButton").onclick = function(){
      draws.pop();
      draw();
    }
};

window.onload = init;