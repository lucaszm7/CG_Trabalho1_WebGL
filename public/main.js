"use strict";
const mat4 = glMatrix.mat4;
const gui = new dat.GUI();
var objectsToDraw  = []

class GUIRoot {
    constructor(vertexData, program, gl, gui, objectsToDraw) {
        this.vertexData = vertexData;
        this.program = program;
        this.gl = gl;
        this.gui = gui;
        this.objectsToDraw = objectsToDraw;
    }
    addObject() {
        var objeto = new Objeto(this.vertexData, this.gl)
        this.objectsToDraw.push(objeto);
        objeto.bindAttribuites(this.program, this.gl);
        GUIAddObject(gui, objeto, this.objectsToDraw);
    }
}

class Objeto {
    constructor(vertexData, gl){
        this.translationX = 0;
        this.translationY = 0;
        this.translationZ = 0;
        this.translation = [this.translationX,this.translationY,this.translationZ];
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.rotation = [this.rotationX,this.rotationY,this.rotationZ];
        this.scaleX = 1;
        this.scaleY = 1;
        this.scaleZ = 1;
        this.scale = [this.scaleX,this.scaleY,this.scaleZ];
        this.vertexData = vertexData;
        this.colorData = setColorData();
        this.vao = gl.createVertexArray();
        this.modelMatrix = mat4.create();
        this.matrixMultiply();
        this.init();
    };

    //For n attribuites: create another paramenter "indexAttribuites"
    //that is a list with the string with the names of all attribuites;
    bindAttribuites(program, gl){
        gl.bindVertexArray(this.vao);
        let positionBuffer = gl.createBuffer();
        let positionLocation = gl.getAttribLocation(program, `a_position`);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexData), gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        
        let colorBuffer = gl.createBuffer();
        let colorLocation = gl.getAttribLocation(program, `a_color`);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.enableVertexAttribArray(colorLocation);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colorData), gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
    };

    init(){
        mat4.translate(this.modelMatrix, this.modelMatrix, [0,0,-3]);
    }

    matrixMultiply() {
        mat4.scale(this.modelMatrix, this.modelMatrix, this.scale);
        mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotationX * Math.PI/180);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotationY * Math.PI/180);
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotationZ * Math.PI/180);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.translation);
    };

    rotationMultiply(){
        mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotationX);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotationY);
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotationZ);
    }
}


function randomColor () {
    return [ Math.random(), Math.random(), Math.random()];
}

function setColorData () {
    let colorDataAux = [];
    for (let face = 0; face < 6; face++){
        let faceColor = randomColor();
        for (let vertex = 0; vertex < 6; vertex++){
            colorDataAux.push(...faceColor);
        }
    }
    return colorDataAux;
}

function compileShader(gl, shaderSource, shaderType) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }
    return shader;
};

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        throw ("program filed to link:" + gl.getProgramInfoLog (program));
    }
    return program;
};

const vertexShaderSource = 
`#version 300 es

uniform mat4 u_mvpMatrix;
uniform vec3 u_translation;

in vec3 a_position;
in vec3 a_color;

out vec3 v_color;
out vec4 v_position;

void main() {
    vec3 finalPosition = a_position + u_translation;
    gl_Position = u_mvpMatrix * vec4(finalPosition, 1);

    v_position = gl_Position;
    v_color = a_color;
}
`;

const fragmentShaderSource = 
`#version 300 es
precision highp float;

in vec3 v_color;
in vec4 v_position;

out vec4 outColor;

void main() {
    outColor = vec4(v_color, 1.0);
}
`;

function main() {
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        throw new Error ("WebGL not supported");
    }
    
    var vertexData = [
        
        //FRONT
        0.5, 0.5, 0.5, 
        0.5, -.5, 0.5,  
        -.5, 0.5, 0.5,  

        -.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        -.5, -.5, 0.5,


        // Left
        -.5, 0.5, 0.5,
        -.5, -.5, 0.5,
        -.5, 0.5, -.5,

        -.5, 0.5, -.5,
        -.5, -.5, 0.5,
        -.5, -.5, -.5,


        // Back
        -.5, 0.5, -.5,
        -.5, -.5, -.5,
        0.5, 0.5, -.5,

        0.5, 0.5, -.5,
        -.5, -.5, -.5,
        0.5, -.5, -.5,


        // Right
        0.5, 0.5, -.5,
        0.5, -.5, -.5,
        0.5, 0.5, 0.5,

        0.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        0.5, -.5, -.5,


        // Top
        0.5, 0.5, 0.5,
        0.5, 0.5, -.5,
        -.5, 0.5, 0.5,

        -.5, 0.5, 0.5,
        0.5, 0.5, -.5,
        -.5, 0.5, -.5,


        // Bottom
        0.5, -.5, 0.5,
        0.5, -.5, -.5,
        -.5, -.5, 0.5,

        -.5, -.5, 0.5,
        0.5, -.5, -.5,
        -.5, -.5, -.5,
    ];
    
    var vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    var fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    var program = createProgram(gl, vertexShader, fragmentShader);
    
    var guiRoot = new GUIRoot(vertexData, program, gl, gui, objectsToDraw)
    loadGUI(gui, guiRoot);

    const uniformLocation = {
        mvpMatrix: gl.getUniformLocation(program, `u_mvpMatrix`),
        translationLocation: gl.getUniformLocation(program, `u_translation`),
    };

    var viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix,
        75 * Math.PI/180,//Vertical Field-of-view (angle, radiants)
        canvas.width/canvas.height, //Aspect-ratio
        1e-4, // Near-distance    
        1e4 // Far-distance
    );
    const modelViewMatrix = mat4.create();
    const mvpMatrix = mat4.create();
    mat4.invert(viewMatrix, viewMatrix);

    requestAnimationFrame(drawScene);
    
    function drawScene () {

        objectsToDraw.forEach(function(objeto) {
            gl.bindVertexArray(objeto.vao);
            gl.useProgram(program);
            gl.enable(gl.DEPTH_TEST);
            
            objeto.rotationMultiply();
            mat4.multiply(modelViewMatrix, viewMatrix, objeto.modelMatrix);
            mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix);
            
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.uniform3fv(uniformLocation.translationLocation, [objeto.translationX,objeto.translationY,objeto.translationZ]);
            gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
        
        });
        requestAnimationFrame(drawScene);
    }
}

main();