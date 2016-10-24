"use strict";

var gl;
var points = [];
var numOfSubdivisions = 5;
var theta = 1.0;
var thetaLoc;
var vFragColor;
var shape = 1;

function triangle(a , b, c)
{
   // puts the 3 vertices of a triangle into the points array

   points.push(a,b,c);

}


function divideTriangle(a, b, c)
{
   //return tree new vertices with the first one being unchanged 
   //and the other 2 as the middle point beetwen them and the first vertice

   var returnArray = new Array();
   returnArray[0] = a.slice();
   returnArray[1] = b.slice();
   returnArray[2] = c.slice();

   
   returnArray[1][0] = linearComb(a[0],b[0],0.5);
   returnArray[1][1] = linearComb(a[1],b[1],0.5);
   returnArray[2][0] = linearComb(a[0],c[0],0.5);
   returnArray[2][1] = linearComb(a[1],c[1],0.5);
   return returnArray;
}

function middleTriangle(a, b, c)
{
   //return  new vertices for the middle triangle

   var returnArray = new Array();
   returnArray[0] = a.slice();
   returnArray[1] = b.slice();
   returnArray[2] = c.slice();

   
   returnArray[0][0] = linearComb(c[0],b[0],0.5);
   returnArray[0][1] = linearComb(c[1],b[1],0.5);

   returnArray[1][0] = linearComb(a[0],b[0],0.5);
   returnArray[1][1] = linearComb(a[1],b[1],0.5);
   returnArray[2][0] = linearComb(a[0],c[0],0.5);
   returnArray[2][1] = linearComb(a[1],c[1],0.5);
   return returnArray;
}


function recursiveTriangles(verticesTriangle, iterations){
   // console.log(iterations);

   if(iterations == 0){
      triangle(verticesTriangle[0],verticesTriangle[1],verticesTriangle[2]);
      return;
   }
   //call the divide function using each of the verticesTriangle as anchor
   // in order to make 3 new triangles


   iterations = iterations - 1;


   recursiveTriangles(middleTriangle(verticesTriangle[0],verticesTriangle[1],verticesTriangle[2]), iterations);

   recursiveTriangles(divideTriangle(verticesTriangle[1],verticesTriangle[0],verticesTriangle[2]), iterations);

   recursiveTriangles(divideTriangle(verticesTriangle[0],verticesTriangle[1],verticesTriangle[2]), iterations);

   recursiveTriangles(divideTriangle(verticesTriangle[2],verticesTriangle[1],verticesTriangle[0]), iterations);
   


}

window.onload = function init()
{
   var canvas = document.getElementById( "gl-canvas" );

   gl = WebGLUtils.setupWebGL( canvas );
   if ( !gl ) { alert( "WebGL isn't available" ); }

   //slider

   document.getElementById("sliderDiv").onchange = function(event) {
      numOfSubdivisions = this.value;
      showValue(this.value);
      points = [];
      init();
   }

   document.getElementById("sliderTheta").onchange = function(event) {
      theta = this.value;
      points = [];
      init();
   }

   if(shape == 1){
      var vertices = []; 
      vertices.push([-0.7, -0.7]);
      vertices.push([0, 0.7]);
      vertices.push([0.7, -0.7]);
      recursiveTriangles(vertices,numOfSubdivisions);
   }

   if(shape == 2){
      var vertices1 = []; 
      var vertices2 = []; 

      vertices1.push([-0.7, -0.7]);
      vertices1.push([-0.7, 0.7]);
      vertices1.push([0.7, -0.7]);
      recursiveTriangles(vertices1,numOfSubdivisions);

      vertices2.push([0.7, -0.7]);
      vertices2.push([0.7, 0.7]);
      vertices2.push([-0.7, 0.7]);
      recursiveTriangles(vertices2,numOfSubdivisions);
   }

   if(shape == 3){
      var vertices1 = []; 
      var vertices2 = []; 

      vertices1.push([-0.7, 0]);
      vertices1.push([0.7, 0]);
      vertices1.push([0, 0.7]);
      recursiveTriangles(vertices1,numOfSubdivisions);

      vertices2.push([-0.7, 0]);
      vertices2.push([0.7, 0]);
      vertices2.push([0, -0.7]);
      recursiveTriangles(vertices2,numOfSubdivisions);
   }
   //  Configure WebGL

   gl.viewport( 0, 0, canvas.width, canvas.height );
   gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

   //  Load shaders and initialize attribute buffers

   var program = initShaders( gl, "vertex-shader", "fragment-shader" );
   gl.useProgram( program );

   // Load the data into the GPU

   
   var bufferId = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
   gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

   // Load the value of theta
   //
   
   thetaLoc = gl.getUniformLocation( program, "theta");

   gl.uniform1f(thetaLoc, theta);
   // Associate out shader variables with our data buffer

   var vPosition = gl.getAttribLocation( program, "vPosition" );

   gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
   gl.enableVertexAttribArray( vPosition );


   vFragColor = gl.getUniformLocation(program, "vFragColor"); 

   //event listeners for buttons

   document.getElementById( "triButton" ).onclick = function () {
      shape = 1;
      points = [];
      init();
   }

   document.getElementById( "sqButton" ).onclick = function () {
      shape = 2;
      points = [];
      init();
   }

   document.getElementById( "losButton" ).onclick = function () {
      shape = 3;
      points = [];
      init();
   }


   render();

};


function render() {
   gl.clear( gl.COLOR_BUFFER_BIT );
   gl.uniform4fv(vFragColor,[1,0,0,1]);
   gl.drawArrays( gl.TRIANGLES ,0,points.length);
   
   window.requestAnimFrame(render);
   // gl.lineWidth(1.2);
   // gl.uniform4fv(vFragColor,[0,0,0,1]);
   // for (var i = 0; i*3 < points.length; i++){
   //    gl.drawArrays( gl.LINE_LOOP, i*3,3);
   // }

}

function linearComb(x, y, multiplier)
{
   // get linear combination of 2 points
   // multiplier must be in range [0,1]

   return ((x * multiplier) + (y * (1 - multiplier)));
}
