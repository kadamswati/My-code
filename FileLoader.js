import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

class FileLoader {
  /**
   * Creates a file loader instance for added 3D Viewer.
   * File loader instance used for below functionalities :
   * 1. Load the 3D files
   * 2. Set the default view of the loaded models in the added 3D Viewer
   * File format supported by 3D Viewer are : GLTF, GLB, 3DM, OBJ+MTL, OBJ
   * @param {Object} viewerInstance Pass the instance of added 3D Viewer
   * @returns {Object} Creates a file loader instance for added 3D Viewer
   */
  constructor(viewerInstance) {
    this.registered = {};
    this.viewer = viewerInstance;
    this.arrayOfModel = [];
    this.group = new THREE.Group();
  }

  clearModels() {
    this.arrayOfModel = [];
    this.group = new THREE.Group();
  }

  addEventListener(name, callback) {
    if (!this.registered[name]) this.registered[name] = [];
    this.registered[name].push(callback);
  }
  triggerEvent(name, args) {
    this.registered[name].forEach((fnc) => fnc.apply(this, args));
  }

  // multiple model loading
  setObjects(arrayOfModel) {
    arrayOfModel.forEach((object) => {
      this.group.add(object);
    });
    this.setObject(this.group);
    this.viewer.render();
  }

  // set object
  setObject(object) {
    this.calculateBoundingBoxOfModel(object);
    this.addModelInViewer(object);
    this.viewer.render();
  }

  // calculate bounding box of the loaded model
  calculateBoundingBoxOfModel(object, percentage = 1) {
    var box = new THREE.Box3().setFromObject(object);
    var vector = box.max.distanceTo(box.min);
    var center = box.getCenter(new THREE.Vector3());
    var y_distance = vector * 1.5 + center.y;
    var x_distance = vector * 1.5 + center.x
    this.viewer.camera.position.set(x_distance / percentage, y_distance / percentage, center.z * 4);
    this.viewer.camera.updateProjectionMatrix();
    var size = box.getSize(new THREE.Vector3());
    var maxSize = Math.max(size.x, size.y, size.z) * 1;
    this.viewer.orbitControls.target = center;
    this.viewer.orbitControls.update();
    this.viewer.render();
  }

  // add model in viewer
  addModelInViewer(object) {
    const viewer = this.viewer;
    viewer.modelScene.add(object);
    viewer.modelScene.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.layers.enable(1);
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    viewer.modelScene.traverse(function (object) {
      if (object.material) {
        viewer.model.add(object.clone());
      }
    });
    viewer.render();
  }

  /**
   * Set the default view of loaded models in the added 3D Viewer
   * @returns {Object} It returns an object for acknowledge of this API to consumer side.
   */
  zoomExtents() {
    try {
      if (this.viewer.modelScene.children[0]) {
        this.calculateBoundingBoxOfModel(this.viewer.modelScene.children[0]);
        this.viewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Model has been focused.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Please load model in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      console.error(err.message);
      return returnValue;
    }
  }

  /**
   * Load the model(s) in the 3D Viewer using a file loader instance.
   * Support GLTF, GLB, 3DM, OBJ formated files only.
   * @param {FileList} files Pass the multiple files of GLTF, GLB, 3DM, OBJ formats
   * @returns {Object} It returns an object for acknowledge of this API to consumer side.
   */
  addModel(files) {
    try {
      if (this.viewer.isModelDisposed) this.clearModels();
      if (files != undefined) {
        for (let element of files) {
          let fileName = element.name;
          let fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
          if (fileType == 'gltf' || fileType == 'glb') {
            this.gltfFileLoad(element);
          } else if (fileType == '3dm') {
            this.rhino3dmFileLoad(element);
          } else if (fileType == 'obj') {
            this.objFileLoad(element);
          }
        }
        var returnValue = {
          'status': 'success',
          'message': 'Model loaded.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Add file to load in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      console.error(err.message);
      return returnValue;
    }
  }

  /**
   * Load the model of GLTF, GLB format in the added 3D Viewer.
   * @param {file} file Pass the GLTF or GLB formated file at a time
   * @returns {Object} It returns an object for acknowledge of this API to consumer side.
   */
  gltfFileLoad(file) {
    try {
      let fileName = file.name;
      let fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
      if (fileType == 'gltf' || fileType == 'glb') {
        var gltfLoader = new GLTFLoader();
        let fileURL = URL.createObjectURL(file);
        if (fileURL) {
          gltfLoader.load(fileURL, (gltf) => {
            if (this.viewer.isModelDisposed) this.clearModels();
            this.arrayOfModel.push(gltf.scene);
            this.setObjects(this.arrayOfModel);
            this.triggerEvent('load-finished');
          });
        }
        this.viewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'GLTF or GLB Model loaded.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Please load GLTF or GLB model.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      console.error(err.message);
      return returnValue;
    }
  }

  /**
   * Load the model of GLTF, GLB format through URL link in the added 3D Viewer
   * @param {URL} url Pass the URL link of the GLTF, GLB formated file
   * @returns {Object} It returns an object for acknowledge of this API to consumer side.
   */
  gltfFileLoadfromURL(url) {
    try {
      let fileName = file.name;
      let fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
      if (fileType == 'gltf' || fileType == 'glb') {
        var gltfLoader = new GLTFLoader();
        let fileURL = url;
        if (fileURL) {
          gltfLoader.load(fileURL, (gltf) => {
            if (this.viewer.isModelDisposed) this.clearModels();
            this.arrayOfModel.push(gltf.scene);
            this.setObjects(this.arrayOfModel);
            this.triggerEvent('load-finished');
          });
        }
        this.viewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'GLTF or GLB Model loaded from URL.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Please load GLTF or GLB model from URL.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      console.error(err.message);
      return returnValue;
    }
  }

  /**
    * Load the model of 3DM format in the added 3D Viewer
    * @param {file} file Pass the 3DM formated file at a time
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
  rhino3dmFileLoad(file) {
    try {
      let fileName = file.name;
      let fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
      if (fileType == '3dm') {
        var rhino3dmLoader = new Rhino3dmLoader();
        rhino3dmLoader.setLibraryPath(
          'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/'
        );
        if (file) {
          let fileURL = URL.createObjectURL(file);
          if (fileURL) {
            rhino3dmLoader.load(fileURL, (object) => {
              if (this.viewer.isModelDisposed) this.clearModels();
              this.arrayOfModel.push(object);
              this.setObjects(this.arrayOfModel);
              this.triggerEvent('load-finished');
            });
          }
        }
        this.viewer.render();
        var returnValue = {
          'status': 'success',
          'message': '3DM Model loaded.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Please load 3DM model.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      console.error(err.message);
      return returnValue;
    }
  }

  /**
   * Load the model of 3DM format through URL link in the added 3D Viewer
   * @param {URL} url Pass the URL link of the 3DM formated file
   * @returns {Object} It returns an object for acknowledge of this API to consumer side.
   */
  rhino3dmFileLoadfromUrl(url) {
    try {
      //let fileName = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
      let fileName = url.substring((url.lastIndexOf('.') + 1), (url.lastIndexOf('.') + 4)).toLowerCase();
      if (fileName == '3dm') {
        let fileURL = url;
        var rhino3dmLoader = new Rhino3dmLoader();
        rhino3dmLoader.setLibraryPath(
          'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/'
        );
        rhino3dmLoader.load(
          fileURL,
          (object) => {
            if (this.viewer.isModelDisposed) this.clearModels();
            this.arrayOfModel.push(object);
            this.setObjects(this.arrayOfModel);
            this.triggerEvent('load-finished');
          }, // called as loading progresses
          function (xhr) {
            //console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
          // called when loading has errors
          function (error) {
            console.log('An error happened' + error);
          }
        );
        this.viewer.render();
        var returnValue = {
          'status': 'success',
          'message': '3DM Model loaded from URL.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Please load 3DM model from URL.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      console.error(err.message);
      return returnValue;
    }
  }

  /**
   * Load the model of 3DM model of the Byte Array format in added 3D Viewer
   * @param {file} file Pass the 3DM file of the Byte Array format at a time
   * @returns {Object} It returns an object for acknowledge of this API to consumer side.
   */
  rh3dmFileLoadByteArray(byteArray) {
    let buffer = byteArray.buffer;
    var rhino3dmLoader = new Rhino3dmLoader();
    rhino3dmLoader.setLibraryPath(
      'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/'
    );
    rhino3dm().then(async (m) => {
      // create a copy of the doc.toByteArray data to get an ArrayBuffer
      rhino3dmLoader.parse(buffer, function (object) {
        if (this.viewer.isModelDisposed) this.clearModels();
        this.arrayOfModel.push(object);
        this.setObjects(this.arrayOfModel);
        this.triggerEvent('load-finished');
      });
    });
  }

  /**
   * Load the model of OBJ with MTL file format in the added 3D Viewer
   * @param {file} mtlFile Pass the MTL formated file at a time
   * @param {file} objFile Pass the OBJ formated file at a time
   * @returns {Object} It returns an object for acknowledge of this API to consumer side.
   */
  mtlFileLoad(mtlFile, objFile) {
    try {
      let mtlFileName = mtlFile.name;
      let mtlFileType = mtlFileName.substring(mtlFileName.lastIndexOf('.') + 1).toLowerCase();
      let objFileName = objFile.name;
      let objFileType = objFileName.substring(objFileName.lastIndexOf('.') + 1).toLowerCase();
      if (mtlFileType == 'mtl' && objFileType == 'obj') {
        var mtlLoader = new MTLLoader();
        if (mtlFile) {
          let mtlUrl = URL.createObjectURL(mtlFile);
          if (mtlUrl) {
            mtlLoader.load(mtlUrl, function (materials) {
              materials.preload();
              var objLoader = new OBJLoader();
              objLoader.setMaterials(materials);
              if (objFile) {
                let objUrl = URL.createObjectURL(objFile);
                if (objUrl) {
                  objLoader.load(objUrl, (object) => {
                    if (this.viewer.isModelDisposed) this.clearModels();
                    this.arrayOfModel.push(object);
                    this.setObjects(this.arrayOfModel);
                    this.triggerEvent('load-finished');
                  });
                }
              }
            });
          }
        }
        this.viewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'OBJ model with MTL file loaded.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Please load OBJ model with MTL file.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      console.error(err.message);
      return returnValue;
    }
  }

  /**
   * Load the model of OBJ format in the added 3D Viewer
   * @param {file} file Pass the OBJ formated file at a time
   * @returns {Object} It returns an object for acknowledge of this API to consumer side.
   */
  objFileLoad(file) {
    try {
      let fileName = file.name;
      let fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
      if (fileType == 'obj') {
        var objLoader = new OBJLoader();
        if (file) {
          let fileURL = URL.createObjectURL(file);
          if (file) {
            objLoader.load(fileURL, (object) => {
              if (this.viewer.isModelDisposed) this.clearModels();
              this.arrayOfModel.push(object);
              this.setObjects(this.arrayOfModel);
              this.triggerEvent('load-finished');
            });
          }
        }
        this.viewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'OBJ model loaded.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Please load OBJ model.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      console.error(err.message);
      return returnValue;
    }
  }
}

export { FileLoader };