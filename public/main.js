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

// 1TH
const vertexData = [
    -1, -1, 0, //V0.position
    0, 1, 0,   //V1.position
    1, -1, 0,  //V2.position
];

const colorData = [
    1, 0, 0,   //V0.color
    0, 1, 0,   //V1.color
    0, 0, 1,   //V2.color
];

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);


// 2TH
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
attribute vec3 position;
void main() {
    gl_Position = vec4(position, 1);
}
`);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `

void main() {
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
`);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);


// 3TH
const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);