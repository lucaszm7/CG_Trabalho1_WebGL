const loadGUI = (gui, guiRoot, camera) => {
  gui.add(guiRoot, "addObject");
  const cameraFolder = gui.addFolder("Camera");
  cameraFolder.add(camera, "fieldOfView", -120, 120, 10);
  cameraFolder.add(camera, "aspectRatio", -5, 5, 0.5);
  cameraFolder.add(camera, "near", 0, 300, 30);
  cameraFolder.add(camera, "far", 0, 300, 30);
  cameraFolder.add(camera, "viewX", -3, 3, 0.1);
  cameraFolder.add(camera, "viewY", -3, 3, 0.1);
  cameraFolder.add(camera, "viewZ", -3, 3, 0.1);
};

const GUIAddObject = (gui, object, objectsToDraw) => {
  console.log(objectsToDraw);
  const objectFolder = gui.addFolder("Object" + objectsToDraw.length);
  const translationFolder = objectFolder.addFolder("Translation");
  translationFolder.add(object, "translationX", -6, 6, 0.3);
  translationFolder.add(object, "translationY", -6, 6, 0.3);
  translationFolder.add(object, "translationZ", -6, 6, 0.3);
  const rotationFolder = objectFolder.addFolder("Rotation");
  rotationFolder.add(object, "rotationX", -180, 180, 15);
  rotationFolder.add(object, "rotationY", -180, 180, 15);
  rotationFolder.add(object, "rotationZ", -180, 180, 15);
  const scaleFolder = objectFolder.addFolder("Scale");
  scaleFolder.add(object, "scaleX", -2, 2, 0.1);
  scaleFolder.add(object, "scaleY", -2, 2, 0.1);
  scaleFolder.add(object, "scaleZ", -2, 2, 0.1);
};

const GUIWorking = () => {
  console.log("OBJECT CREATED");
};
