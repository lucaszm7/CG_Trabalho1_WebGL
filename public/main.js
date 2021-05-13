"use strict";
const mat4 = glMatrix.mat4;
const gui = new dat.GUI();
const objectsToDraw  = []

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
class Animation {
    constructor(gl, gui, program, objectsToDraw, camera, viewProjectionMatrix, mvpMatrix){
        this.program = program;
        this.gl = gl;
        this.gui = gui;
        this.objectsToDraw = objectsToDraw;
        this.camera = camera;
        this.object = null;
        this.uniformLocation = {
            mvpMatrix: this.gl.getUniformLocation(this.program, `u_mvpMatrix`),
        };
        
        this.viewProjectionMatrix = viewProjectionMatrix;
        this.mvpMatrix = mvpMatrix
    
        this.rotationSpeed = radToDeg(1.2);
        this.then = 0;
        //Radianos por segundo
    }
    callAnimete(){
        requestAnimationFrame(this.animate);
    }
    animate(now){
        if(now == null){
            now = 0;
        }
        now *= 0.001;
        var deltaTime = now - this.then;
        this.then = now;

        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.objectsToDraw[this.object].vao);
        this.gl.enable(this.gl.DEPTH_TEST);
        
        this.objectsToDraw[this.object].rotationX += this.rotationSpeed * deltaTime;
        console.log(this.objectsToDraw[this.object].rotationX);
        this.objectsToDraw[this.object].matrixMultiply();
        this.camera.computeView();
        this.camera.computeProjection();

        mat4.multiply(this.viewProjectionMatrix, this.camera.viewMatrix, this.camera.projectionMatrix);
        mat4.multiply(this.mvpMatrix, this.viewProjectionMatrix, this.objectsToDraw[this.object].modelMatrix);
        
        this.gl.uniformMatrix4fv(this.uniformLocation.mvpMatrix, false, this.mvpMatrix);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.objectsToDraw[this.object].vertexData.length / 3);

        if(this.objectsToDraw[this.object].rotationX <= 60){
            requestAnimationFrame(this.animate);
        }
    }
}
class Camera {
    constructor(fieldOfView, aspectRatio, near, far){
        this.up = [0, 1, 0];
        this.viewMatrix = mat4.create();
        this.viewX = 0;
        this.viewY = 0;
        this.viewZ = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        mat4.invert(this.viewMatrix, this.viewMatrix);
        this.projectionMatrix = mat4.create();
        this.fieldOfView = fieldOfView;
        this.aspectRatio = aspectRatio;
        this.near = near;
        this.far = far;
        mat4.perspective(this.projectionMatrix,
                        degToRad(fieldOfView),
                        aspectRatio,
                        near,
                        far);
    }
    computeProjection(){
        mat4.perspective(this.projectionMatrix,
            degToRad(this.fieldOfView),
            this.aspectRatio,
            this.near,
            this.far);
    }
    computeView(lookingAt){
        var auxView = mat4.create();
        mat4.rotateX(auxView, auxView, degToRad(this.rotationX));
        mat4.rotateY(auxView, auxView, degToRad(this.rotationY));
        mat4.rotateZ(auxView, auxView, degToRad(this.rotationZ));
        mat4.translate(auxView, auxView, [this.viewX, this.viewY, this.viewZ]);
        //mat4.lookAt(auxView, [auxView[12],auxView[13],auxView[14]], lookingAt, this.up);
        mat4.invert(this.viewMatrix, auxView);
    }
}
class Objeto {
    constructor(vertexData, gl){
        this.translationX = 0;
        this.translationY = 0;
        this.translationZ = -20;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.scaleZ = 1;
        this.vertexData = vertexData;
        this.colorData = setColorData();
        this.vao = gl.createVertexArray();
        this.modelMatrix = mat4.create();
        this.matrixMultiply();
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

    matrixMultiply() {
        let auxMatrix = mat4.create();
        mat4.translate(auxMatrix, auxMatrix, [this.translationX,this.translationY,this.translationZ]);
        mat4.rotateX(auxMatrix, auxMatrix, degToRad(this.rotationX));
        mat4.rotateY(auxMatrix, auxMatrix, degToRad(this.rotationY));
        mat4.rotateZ(auxMatrix, auxMatrix, degToRad(this.rotationZ));
        mat4.scale(this.modelMatrix, auxMatrix, [this.scaleX,this.scaleY,this.scaleZ]);
    };
}
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
function radToDeg(r) {
    return r * 180 / Math.PI;
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
uniform vec2 u_resolution;

in vec3 a_position;
in vec3 a_color;

out vec3 v_color;
out vec4 v_position;

void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1);

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
        
        //Frente
        -.5, 0.5, 0.5,  
        0.5, 0.5, 0.5, 
        0.5, -.5, 0.5,  

        -.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        -.5, -.5, 0.5,


        // Esquerda
        -.5, 0.5, 0.5,
        -.5, -.5, 0.5,
        -.5, 0.5, -.5,

        -.5, 0.5, -.5,
        -.5, -.5, 0.5,
        -.5, -.5, -.5,


        // Atrás
        -.5, 0.5, -.5,
        -.5, -.5, -.5,
        0.5, 0.5, -.5,

        0.5, 0.5, -.5,
        -.5, -.5, -.5,
        0.5, -.5, -.5,


        // Direita
        0.5, 0.5, -.5,
        0.5, -.5, -.5,
        0.5, 0.5, 0.5,

        0.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        0.5, -.5, -.5,


        // Cima
        0.5, 0.5, 0.5,
        0.5, 0.5, -.5,
        -.5, 0.5, 0.5,

        -.5, 0.5, 0.5,
        0.5, 0.5, -.5,
        -.5, 0.5, -.5,


        // Baixo
        0.5, -.5, 0.5,
        0.5, -.5, -.5,
        -.5, -.5, 0.5,

        -.5, -.5, 0.5,
        0.5, -.5, -.5,
        -.5, -.5, -.5,
    ];
    
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const program = createProgram(gl, vertexShader, fragmentShader);
    
    const viewProjectionMatrix = mat4.create();
    const mvpMatrix = mat4.create();

    const camera = new Camera(75, gl.canvas.width/gl.canvas.height, 1, 10000);
    const guiRoot = new GUIRoot(vertexData, program, gl, gui, objectsToDraw);
    const animation = new Animation(gl, gui, program, objectsToDraw, camera, viewProjectionMatrix, mvpMatrix);
    loadGUI(gui, guiRoot, camera, animation);

    const uniformLocation = {
        mvpMatrix: gl.getUniformLocation(program, `u_mvpMatrix`),
    };
    


    var then = 0;
    //Radianos por segundo
    var rotationSpeed = radToDeg(1.2);

    requestAnimationFrame(drawScene);
    function drawScene (now) {

        now *= 0.001;
        var deltaTime = now - then;
        then = now;
        objectsToDraw.forEach(function(objeto) {
            gl.useProgram(program);
            gl.bindVertexArray(objeto.vao);
            //gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);

            if(objeto.animation){
                objeto.rotationX += rotationSpeed * deltaTime;
                if(objeto.rotationX >= 60){
                    objeto.animation = false;
                }
            }

            objeto.matrixMultiply();
            camera.computeView();
            camera.computeProjection();

            mat4.multiply(viewProjectionMatrix, camera.viewMatrix, camera.projectionMatrix);
            mat4.multiply(mvpMatrix, viewProjectionMatrix, objeto.modelMatrix);
            
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
        });
        requestAnimationFrame(drawScene);
    }
}

main();