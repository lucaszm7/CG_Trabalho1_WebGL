const mat4 = glMatrix.mat4;

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error ("WebGL not supported");
}

// === PIPELINE === //

    // 1TH
    // create an VertexData = [...];
    // create GpuBuffer;
    // Attach GpuBuffer to VertexData

    // 2TH
    // create vertex-shader;
    // create fragment-shader;
    // create program;
    // attach shader to program;

    // 3TH
    // ennable vertex-attributes;

    // draw

// === END OF PIPE === //

// ========================== 1TH ========================== //

const vertexData = [
    -1, -1, 0, //V0.position
    -1,  1, 0,  //V1.position
     1, -1, 0,  //V2.position

    -1,  1, 0,  //V3.position
     1, -1, 0,  //V4.position
     1,  1, 0,   //V5.position
];

const colorData = [
    1, 0, 0,   //V0.color
    0, 1, 0,   //V1.color
    0, 0, 1,   //V2.color

    0, 1, 1,   //V1.color
    1, 0, 1,   //V2.color
    1, 1, 0,   //V1.color
];

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.DYNAMIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.DYNAMIC_DRAW);

// ========================== 2TH ========================== //
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
precision mediump float;

attribute vec3 position;
attribute vec3 color;

varying vec3 vColor;
varying vec4 fPosition;

uniform mat4 matrix;

void main() {
    
    fPosition = matrix * vec4(position, 1);

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
    gl_FragColor = fPosition + vec4(vColor, 1.0);
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

const uniformLocation = {
    matrix: gl.getUniformLocation(program, `matrix`),
};

const matrix = mat4.create();
console.log(matrix);
mat4.scale(matrix, matrix, [0.2, 0.2, 0.2]);
mat4.translate(matrix, matrix, [0, 0, 0]);

function animate () {
    requestAnimationFrame(animate);
    mat4.rotateZ(matrix, matrix, Math.PI/240);
    mat4.translate(matrix, matrix, [.02, .02, 0]);
    mat4.scale(matrix, matrix, [1.0001, 1.0001, 1.0001]);
    gl.uniformMatrix4fv(uniformLocation.matrix, false, matrix);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

animate();