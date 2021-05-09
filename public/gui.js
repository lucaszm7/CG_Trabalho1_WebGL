const loadGUI = (gui, guiRoot) => {
  gui.add(guiRoot, "addObject");
};

const GUIAddObject = (gui, object, objectsToDraw) => {
  console.log(objectsToDraw);
  const objectFolder = gui.addFolder("Object" + objectsToDraw.length);
  const translationFolder = objectFolder.addFolder("Translation");
  translationFolder.add(object, "translationX", -1, 1, 0.1);
  translationFolder.add(object, "translationY", -1, 1, 0.1);
  translationFolder.add(object, "translationZ", -1, 1, 0.1);
  const rotationFolder = objectFolder.addFolder("Rotation");
  rotationFolder.add(object, "rotationX", -1, 1, 0.1);
  rotationFolder.add(object, "rotationY", -1, 1, 0.1);
  rotationFolder.add(object, "rotationZ", -1, 1, 0.1);
  const scaleFolder = objectFolder.addFolder("Scale");
  scaleFolder.add(object, "scaleX", -1, 1, 0.1);
  scaleFolder.add(object, "scaleY", -1, 1, 0.1);
  scaleFolder.add(object, "scaleZ", -1, 1, 0.1);
};

const GUIWorking = () => {
  console.log("OBJECT CREATED");
};
