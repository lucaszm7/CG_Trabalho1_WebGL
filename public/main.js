const mat4 = glMatrix.mat4;
loadGUI();

var listOfObjetos = []

class Objeto {
    constructor(){
        this.modelMatrix = mat4.create();
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

const vertexShaderSource = `
precision mediump float;

attribute vec3 position;
attribute vec3 color;

varying vec3 vColor;
varying vec4 fPosition;

uniform mat4 mvpMatrix;

void main() {
    
    fPosition = mvpMatrix * vec4(position, 1);

    vColor = color;
    gl_Position = fPosition;
}
`;

const fragmentShaderSource = `
precision mediump float;

varying vec3 vColor;
varying vec4 fPosition;

void main() {
    //gl_FragColor = fPosition * vec4(vColor, 1.0);
    gl_FragColor = vec4(vColor, 1.0);
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
    var colorData = setColorData();

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    var vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    var fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    var program = createProgram(gl, vertexShader, fragmentShader);

    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const colorLocation = gl.getAttribLocation(program, `color`);
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);

    const uniformLocation = {
        mvpMatrix: gl.getUniformLocation(program, `mvpMatrix`),
    };

    var modelMatrix = mat4.create();
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

    mat4.translate(modelMatrix, modelMatrix, [0, 0, -3]);
    mat4.scale(modelMatrix, modelMatrix, [1, 1, 1]);

    mat4.invert(viewMatrix, viewMatrix);

    requestAnimationFrame(animate);

    function animate () {

        mat4.rotateX(modelMatrix, modelMatrix, obj.rotationX);
        mat4.rotateY(modelMatrix, modelMatrix, obj.rotationY);
        mat4.rotateZ(modelMatrix, modelMatrix, obj.rotationZ);

        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
        mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix);

        gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);

        requestAnimationFrame(animate);
    }
}

main();