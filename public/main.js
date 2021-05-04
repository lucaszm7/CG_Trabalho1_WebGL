const mat4 = glMatrix.mat4;

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error ("WebGL not supported");
}

// ========================== 1TH ========================== //

const vertexData = [

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

function randomColor () {
    return [ Math.random(), Math.random(), Math.random()];
}


const colorData = [];
for (let face = 0; face < 6; face++){
    let faceColor = randomColor();
    for (let vertex = 0; vertex < 6; vertex++){
        colorData.push(...faceColor);
    }
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

// ========================== 2TH ========================== //
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
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
`);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
precision mediump float;

varying vec3 vColor;
varying vec4 fPosition;

void main() {
    //gl_FragColor = fPosition * vec4(vColor, 1.0);
    gl_FragColor = vec4(vColor, 1.0);
}
`);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);


// ========================== 3TH ========================== //
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

// CREATE ALL THE MATRIX NEEDED, WORLD MATRIX AND PERSPECTIVE MATRIX
const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix,
    70 * Math.PI/180,//Vertical Field-of-view (angle, radiants)
    canvas.width/canvas.height, //Aspect-ratio
    1e-4, // Near-distance    
    1e4 // Far-distance
);
const modelViewMatrix = mat4.create();
const mvpMatrix = mat4.create();

mat4.translate(modelMatrix, modelMatrix, [-1.5, 0, -2]);

mat4.translate(viewMatrix, viewMatrix, [-3, 0, 1]);
console.log("VIEW MATRIX: ", viewMatrix);
mat4.invert(viewMatrix, viewMatrix);
console.log("VIEW MATRIX AFTER INVERT: ", viewMatrix);


function animate () {
    requestAnimationFrame(animate);
    //mat4.rotateZ(modelMatrix, modelMatrix, Math.PI/2 /70);
    //mat4.rotateX(modelMatrix, modelMatrix, Math.PI/2 /70);

    //MODEL MATRIX WILL BE APPLY FIRST, AFTER THE VIEW MATRIX
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
    //MODEL-VIEW WILL BE APPLY FIRST ON THE MULTIPLICATION, AFTER THE PROJECTION(PERSPECTIVE) MATRIX
    mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix);

    gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
}

animate();