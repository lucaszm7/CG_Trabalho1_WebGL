"use strict";
const mat4 = glMatrix.mat4;
const gui = new dat.GUI();
const objectsToDraw  = []

function main() {

    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        throw new Error ("WebGL not supported");
    }
    
    const vertexData = [
        
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
    const uniformLocation = {
        mvpMatrix: gl.getUniformLocation(program, `u_mvpMatrix`),
        changeColors: gl.getUniformLocation(program, `u_changeColors`),
    };

    var then_animation = 0;

    var animation = {
        //Graus por segundo
        rotationSpeed: 20,
        translationSpeed: 1,
        indexOfObjeto: 0,
        objetos: [0, 1, 2, 3, 4],
        objetoId: "",
        idOfObjetos: ["element"],
        rotationBeginX: null,
        rotationBeginY: null,
        rotationBeginZ: null,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        translationBeginX: null,
        translationBeginY: null,
        translationBeginZ: null,
        translationX: 0,
        translationY: 0,
        translationZ: 0,
        animateRotate: function(){
            requestAnimationFrame(animation.rotate);
        },
        animateTranslate: function(){
            requestAnimationFrame(animation.translate);
        },
        animateMaster: function(){
            requestAnimationFrame(animation.translate);
            requestAnimationFrame(animation.rotate);
        },
        rotate: function (now) {
            now *= 0.001;
            if(then_animation == 0){
                then_animation = now;
                animation.rotationBeginX = objectsToDraw[animation.indexOfObjeto].rotationX;
                animation.rotationBeginY = objectsToDraw[animation.indexOfObjeto].rotationY;
                animation.rotationBeginZ = objectsToDraw[animation.indexOfObjeto].rotationZ;
            }
            var deltaTime = now - then_animation;
            then_animation = now;
            gl.useProgram(program);
            gl.bindVertexArray(objectsToDraw[animation.indexOfObjeto].vao);
            //gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            
            if(objectsToDraw[animation.indexOfObjeto].rotationX - animation.rotationBeginX <= animation.rotationX){
                objectsToDraw[animation.indexOfObjeto].rotationX += animation.rotationSpeed * deltaTime;
            }
            if(objectsToDraw[animation.indexOfObjeto].rotationY - animation.rotationBeginY <= animation.rotationY){
                objectsToDraw[animation.indexOfObjeto].rotationY += animation.rotationSpeed * deltaTime;
            }
            if(objectsToDraw[animation.indexOfObjeto].rotationZ - animation.rotationBeginZ <= animation.rotationZ){
                objectsToDraw[animation.indexOfObjeto].rotationZ += animation.rotationSpeed * deltaTime;
            }
            objectsToDraw[animation.indexOfObjeto].matrixMultiply();
            camera.computeView();
            camera.computeProjection();

            mat4.multiply(viewProjectionMatrix, camera.viewMatrix, camera.projectionMatrix);
            mat4.multiply(mvpMatrix, viewProjectionMatrix, objectsToDraw[animation.indexOfObjeto].modelMatrix);
            gl.uniform1i(uniformLocation.changeColors, objectsToDraw[animation.indexOfObjeto].changeColors);
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
            // console.log("objectsToDraw[animation.indexOfObjeto].rotationX: " + objectsToDraw[animation.indexOfObjeto].rotationX);
            // console.log("animation.rotationBeginX: " + animation.rotationBeginX);
            // console.log("animation.rotationX: " + animation.rotationX);
            if(objectsToDraw[animation.indexOfObjeto].rotationX - animation.rotationBeginX <= animation.rotationX
                || objectsToDraw[animation.indexOfObjeto].rotationY - animation.rotationBeginY <= animation.rotationY
                || objectsToDraw[animation.indexOfObjeto].rotationZ - animation.rotationBeginZ <= animation.rotationZ){
                requestAnimationFrame(animation.rotate);
            }
            else{
                animation.rotationBeginX = objectsToDraw[animation.indexOfObjeto].rotationX;
                animation.rotationBeginY = objectsToDraw[animation.indexOfObjeto].rotationY;
                animation.rotationBeginZ = objectsToDraw[animation.indexOfObjeto].rotationZ;
                then_animation = 0;
            }
        },
        translate: function(now){
            now *= 0.001;
            if(then_animation == 0){
                then_animation = now;
                animation.translationBeginX = objectsToDraw[animation.indexOfObjeto].translationX;
                animation.translationBeginY = objectsToDraw[animation.indexOfObjeto].translationY;
                animation.translationBeginZ = objectsToDraw[animation.indexOfObjeto].translationZ;
            }
            var deltaTime = now - then_animation;
            then_animation = now;
            gl.useProgram(program);
            gl.bindVertexArray(objectsToDraw[animation.indexOfObjeto].vao);
            //gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            
            if(objectsToDraw[animation.indexOfObjeto].translationX - animation.translationBeginX <= animation.translationX){
                objectsToDraw[animation.indexOfObjeto].translationX += animation.translationSpeed * deltaTime;
            }
            if(objectsToDraw[animation.indexOfObjeto].translationY - animation.translationBeginY <= animation.translationY){
                objectsToDraw[animation.indexOfObjeto].translationY += animation.translationSpeed * deltaTime;
            }
            if(objectsToDraw[animation.indexOfObjeto].translationZ - animation.translationBeginZ <= animation.translationZ){
                objectsToDraw[animation.indexOfObjeto].translationZ += animation.translationSpeed * deltaTime;
            }
            objectsToDraw[animation.indexOfObjeto].matrixMultiply();
            camera.computeView();
            camera.computeProjection();

            mat4.multiply(viewProjectionMatrix, camera.viewMatrix, camera.projectionMatrix);
            mat4.multiply(mvpMatrix, viewProjectionMatrix, objectsToDraw[animation.indexOfObjeto].modelMatrix);
            gl.uniform1i(uniformLocation.changeColors, objectsToDraw[animation.indexOfObjeto].changeColors);
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);

            if(objectsToDraw[animation.indexOfObjeto].translationX - animation.translationBeginX <= animation.translationX
                || objectsToDraw[animation.indexOfObjeto].translationY - animation.translationBeginY <= animation.translationY
                || objectsToDraw[animation.indexOfObjeto].translationZ - animation.translationBeginZ <= animation.translationZ){
                requestAnimationFrame(animation.translate);
            }
            else{
                then_animation = 0;
                animation.translationBeginX = objectsToDraw[animation.indexOfObjeto].translationX;
                animation.translationBeginY = objectsToDraw[animation.indexOfObjeto].translationY;
                animation.translationBeginZ = objectsToDraw[animation.indexOfObjeto].translationZ;
            }
        },
    }

    const indexOfCameras = [0,1,2];
    var selectedCamera = {
        camera: 0,
    }
    const camera = new Camera(75, gl.canvas.width/gl.canvas.height, 1, 1000);
    const camera2 = new Camera(75, gl.canvas.width/gl.canvas.height, 1, 1000);
    const camera3 = new Camera(75, gl.canvas.width/gl.canvas.height, 1, 1000);
    const cameras = [];
    cameras.push(camera, camera2, camera3);
    const guiRoot = new GUIRoot(vertexData, program, gl, gui, objectsToDraw);
    loadGUI(gui, guiRoot, camera, camera2, camera3, selectedCamera, indexOfCameras, animation);

    requestAnimationFrame(drawScene);

    var lookingAt = [0,0,0];
    function drawScene () {

        objectsToDraw.forEach(function(objeto) {
            
            gl.useProgram(program);
            gl.bindVertexArray(objeto.vao);
            //gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            
            if(objeto.lookAt){
                lookingAt = [objeto.modelMatrix[12],objeto.modelMatrix[13],objeto.modelMatrix[14]]
            }

            objeto.matrixMultiply();
            cameras[selectedCamera.camera].computeView(lookingAt);
            cameras[selectedCamera.camera].computeProjection();

            mat4.multiply(viewProjectionMatrix, cameras[selectedCamera.camera].projectionMatrix, cameras[selectedCamera.camera].viewMatrix);
            mat4.multiply(mvpMatrix, viewProjectionMatrix, objeto.modelMatrix);
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.uniform1i(uniformLocation.changeColors, objeto.changeColors);
            gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
        });
        requestAnimationFrame(drawScene);
    }
}

main();