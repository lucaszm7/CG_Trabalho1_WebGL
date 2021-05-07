
var obj = {
    rotationX: 0.01,
    rotationY: 0,
    rotationZ: 0.01,
    scaleRatio: 1,
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    translate: function () {
      mat4.translate(modelMatrix, modelMatrix,[obj.translationX,obj.translationY,obj.translationZ]);
    },
    scale: function() {
      mat4.scale(modelMatrix, modelMatrix, [obj.scaleRatio,obj.scaleRatio,obj.scaleRatio]);
    },
    reset: function() {
      modelMatrix = mat4.create();
      mat4.translate(modelMatrix, modelMatrix, [0, 0, -3]);
    }
};

const loadGUI = () => {
  const gui = new dat.GUI();
  var objFolder = gui.addFolder("Object");
  //gui.remember(obj);
  objFolder.add(obj, "reset");
  objFolder.add(obj, "rotationX", 0, 0.1, 0.01);
  objFolder.add(obj, "rotationY", 0, 0.1, 0.01);
  objFolder.add(obj, "rotationZ", 0, 0.1, 0.01);
  objFolder.add(obj, "scale");
  var Scale = objFolder.addFolder("scaleRatio");
  Scale.add(obj, "scaleRatio", 0.5, 2, 0.0001);
  objFolder.add(obj, "translate");
  var Translation = objFolder.addFolder("Translation");
  Translation.add(obj, "translationX", -1, 1, 0.1);
  Translation.add(obj, "translationY", -1, 1, 0.1);
  Translation.add(obj, "translationZ", -1, 1, 0.1);
};