import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { Sky } from "three/examples/jsm/objects/Sky";
import viewerMgrInstance from './ViewerMgr.js';

var resizeObserver;

// viewer default settings
let _defaultParams = {
  backgroundColor: 0x808080,
  pickColor: 0x72aee6,
  hightlightColor: 0xff00ff,
  ghostColor: 0x000000,
  elevation: 15,
  azimuth: 0,
  sceneScale: 250000,
};

class Viewer {
  /**
   * Adds a 3D Viewer with default or custom viewer settings.
   * Viewer instance used for below functionalities :
   * 1. Register events, single and multiple selection of elements, highlighting elements, clearing selection and highlights of elements, get selected element IDs.
   * 2. Add ground, hemisphere light, fog, etc.
   * 3. Update elevation, azimuth and ground levels, skybox, etc.
   * 4. Apply custom colors, opacity, isolate elements, lock elements
   * 5. Add and remove labels of elements
   * 6. Show or hide elements or model
   * 7. Reset element, color of element
   * 8. Focus or zoom on elements or model
   * 9. Clear all the added 3D Viewer
   * @param {{ backgroundColor: any,  pickColor: any,  hightlightColor: any,  ghostColor: any,  elevation: number,  azimuth: number,  sceneScale: number}} initParams Pass the customized settings to apply on 3D viewer. If customization is not passed then default settings will apply on 3D Viewer.
   * @returns {Object} Returns added 3D viewer.
   */
  constructor(initParams) {
    let params = { ..._defaultParams, ...(initParams || {}) };
    this.name = '';
    this.canvas = null;
    this.scene = null;
    this.modelScene = null;
    this.camera = null;
    this.renderer = null;
    this.orbitControls = null;
    this.mouse = null;
    this.canvasBounds = null;
    this.multipleSelectionFlagCheck = null;
    this.intersected = null;
    this.lastSelectedElement = null;
    this.highlightElementFlagCheck = null;
    this.composer = null;
    this.renderPass = null;
    this.outlinePass = null;
    this.backgroundColor = params.backgroundColor;
    this.pickColor = params.pickColor;
    this.hightlightColor = params.hightlightColor;
    this.ghostColor = params.ghostColor;
    this.model = new Set();
    this.intersectedArray = [];
    this.highLightArray = [];
    this.raycaster = null;
    this.opacityTempMaterial = null;
    this.labelVarible = [];
    this.elevation = params.elevation;
    this.azimuth = params.azimuth;
    this.ground = null;
    this.defaultGroundPosition = null;
    this.sceneScale = params.sceneScale;
    this.lights = [];
    this.isModelDisposed = false;
  }

  /**
   * Add a 3D Viewer instance
   * @param {HTMLDivElement} canvas Pass the HTML Div Element which will act as a 3D Viewer. Passed HTML Div Element width and height must be 100%. 
   * @param {string} name Pass the unique name for adding a 3D Viewer. This name is used later to get the 3D viewer and clear the 3D viewer.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  addViewer(canvas, name) {
    try {
      if ((canvas != undefined || canvas != null) && (name != undefined || name != null)) {
        this.name = name;
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.backgroundColor);
        this.modelScene = new THREE.Object3D();
        this.scene.add(this.modelScene);
        this.camera = new THREE.PerspectiveCamera(50, canvas.offsetWidth / canvas.offsetHeight, 1, 100000);
        this.camera.position.y = 100;
        this.camera.up.set(0, 0, 1);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;
        this.sky = new Sky();
        this.sun = new THREE.Vector3();
        this.sky.scale.setScalar(this.sceneScale);
        this.scene.add(this.sky);
        this.uniforms = this.sky.material.uniforms;
        this.uniforms['turbidity'].value = 10;
        this.uniforms['rayleigh'].value = 3;
        this.uniforms['mieCoefficient'].value = 0.005;
        this.uniforms['mieDirectionalG'].value = 0.7;
        this.uniforms.up.value.set(0, 0, 1);
        this.createDefaultLights();
        this.setLights();
        this.phi = Math.PI * (this.elevation / 180.0 - 0.5);
        this.theta = Math.PI * (this.azimuth / 180.0 - 0.5);
        this.sun.x = Math.sin(this.phi) * Math.sin(this.theta);
        this.sun.y = Math.sin(this.phi) * Math.cos(this.theta);
        this.sun.z = Math.cos(this.phi);
        this.uniforms['sunPosition'].value.copy(this.sun);
        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = this.pmremGenerator.fromScene(this.sky).texture;
        this.composer = new EffectComposer(this.renderer);
        this.canvas.appendChild(this.renderer.domElement);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.mouse = new THREE.Vector2();
        this.canvas.addEventListener('mouseenter', (event) => {
          viewerMgrInstance.setActiveViewerInstance(this);
          this.canvas.style.borderStyle = "solid";
          this.canvas.style.borderColor = "#0000FF";
        });
        this.canvas.addEventListener('mouseout', (event) => {
          viewerMgrInstance.setActiveViewerInstance(undefined);
          this.canvas.style.borderStyle = "none";
        });
        this.canvas.addEventListener('mousedown', (e) => this.mouseDownEvent(e), false);
        var returnValue = {
          'status': 'success',
          'message': 'Viewer created successfully.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Canvas or viewer name is either undefined or null.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  mouseDownEvent(event) { this.isDragged = false; }

  /**
   * Register the events for selecting and highlighting the elements of the added 3D Viewer.
   * Use a predefined event name only to register the events. Event names are case-sensitive. Below are predefined names for events : 
   * 1. element-select - for selecting the elements
   * 2. element-highlight - for highlighting the element
   * @param {string} eventName Pass the predefined name of event to register the respective event. 
   * @param {Function} callBack Handle The callBack is a function at the consumer side as the element ID is getting returned through the callback function.
   * @returns {any} Returns the selected or highlighted element ID at consumer side callback function.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  registerEvent(eventName, callBack) {
    try {
      if ((eventName != undefined || eventName != null) && (callBack != undefined || callBack != null)) {
        switch (eventName) {
          case 'element-select': this.canvas.addEventListener('click', (e) => this.pickElement(e, callBack), false);
            break;
          case 'element-highlight': this.canvas.addEventListener('mousemove', (e) => this.highlightElement(e, callBack), false);
            break;
        }
        var returnValue = {
          'status': 'success',
          'message': 'Event registered on viewer successfully.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Event name or callback is either undefined or null.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Updates the sun position at a certain elevated angle in the skybox.
   * @param {number} elevationVal The elevation angle value must be in between 0 to 180 degrees.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  updateElevation(elevationVal) {
    try {
      if (elevationVal >= 0.0 && elevationVal <= 180.0) {
        this.elevation = elevationVal;
        this.phi = Math.PI * (this.elevation / 180.0 - 0.5);
        this.setSkyPosition();
        this.render()
        var returnValue = {
          'status': 'success',
          'message': 'Elevation angle updated successfully.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Elevation angle value must be in between 0.0 to 180.0.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  //Create Basic Lighting for the scene
  createDefaultLights() {
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHex(0xd3d1c2)
    dirLight.position.set(- .5, 1, 2);
    dirLight.position.multiplyScalar(1000);
    dirLight.intensity = 3;
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    const d = 50;
    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;
    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = - 0.0001;
    this.lights.push(dirLight);
    const dirLight_two = new THREE.DirectionalLight(0xFCF9D9, 1);
    dirLight_two.color.setHex(0xd9f4fc)
    dirLight_two.position.set(1, -1, 3);
    dirLight_two.intensity = 3;
    dirLight_two.position.multiplyScalar(1000);
    dirLight_two.castShadow = true;
    dirLight_two.shadow.mapSize.width = 2048;
    dirLight_two.shadow.mapSize.height = 2048;
    const d_2 = 50;
    dirLight_two.shadow.camera.left = - d_2;
    dirLight_two.shadow.camera.right = d_2;
    dirLight_two.shadow.camera.top = d_2;
    dirLight_two.shadow.camera.bottom = - d_2;
    dirLight_two.shadow.camera.far = 3500;
    dirLight_two.shadow.bias = - 0.0001;
    this.lights.push(dirLight_two);
  }

  //Add lights
  setLights() {
    for (let light of this.lights) { this.scene.add(light); }
  }

  //Add lights
  setLightShadows(showShadows) {
    for (let light of this.lights) { light.castShadow = showShadows; }
  }

  setSkyPosition() {
    this.sun.z = Math.cos(this.phi);
    this.sun.x = Math.sin(this.phi) * Math.sin(this.theta);
    this.sun.y = Math.sin(this.phi) * Math.cos(this.theta);
    this.uniforms['sunPosition'].value.copy(this.sun);
    this.scene.environment = this.pmremGenerator.fromScene(this.sky).texture;
    this.render();
  }

  /**
   * Updates the sun position at a certain azimuth angle.
   * @param {number} elevationVal The azimuth angle must be between 0 to 360 degrees.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  updateAzimuth(azimuthVal) {
    try {
      if (azimuthVal >= 0.0 && azimuthVal <= 360.0) {
        this.azimuth = azimuthVal + 90;
        this.theta = Math.PI * (this.azimuth / 180.0 - 0.5);
        this.setSkyPosition();
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Azimuth angle updated successfully.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Azimuth angle must be in between 0.0 to 360.0'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Add a ground in added 3D Viewer
   * @param {boolean} active Add or remove ground on the passed boolean value.
   * @param {any} color Accept only Hex color code and get applied on ground as a ground color
   * @param {number} opacity Set the opacity of ground from 0 to 1 value only.
   * @param {number} size Set width and height of ground.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  setSceneGround(active, color, opacity, size) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children != 0) {
        currentViewer.scene.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.name == 'sceneGround')
            currentViewer.scene.remove(child);
        });
        var groundGeometry = new THREE.PlaneGeometry(size, size);
        var groundMaterial = new THREE.MeshStandardMaterial({ color: color, transparent: true, opacity: opacity, side: THREE.DoubleSide, });
        currentViewer.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        currentViewer.scene.add(currentViewer.ground);
        currentViewer.ground.layers.enable(1); // layer 1
        currentViewer.ground.name = 'sceneGround';
        //currentViewer.ground.rotateX(Math.PI / 2.0);
        currentViewer.ground.receiveShadow = true;
        var box = new THREE.Box3();
        var targetModel = [];
        currentViewer.modelScene.traverse((child) => {
          if (
            child instanceof THREE.Mesh &&
            !targetModel.includes(child.parent)
          ) {
            targetModel.push(child.parent);
            box.expandByObject(child.parent);
          }
        });
        currentViewer.ground.position.set(box.min.x, box.min.y, box.min.z);
        currentViewer.defaultGroundPosition = currentViewer.ground.position.z;
        if (active) currentViewer.ground.visible = true;
        else currentViewer.ground.visible = false;
        // currentViewer.updateGroundLevel(height);
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Ground added in the viewer successfully.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Please load model and then add ground in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Set added ground position at certain ground level.
   * If ground is not added then use setSceneGround API to add ground
   * @param {number} groundLevel Set the ground position at the passed ground level value.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  updateGroundLevel(groundLevel) {
    try {
      if (this.ground != undefined || this.ground != null) {
        if (groundLevel === 0) {
          this.ground.position.z = this.defaultGroundPosition;
        } else if (groundLevel > 0) {
          this.ground.position.z = this.ground.position.z + groundLevel;
        } else if (groundLevel < 0) {
          this.ground.position.z = this.ground.position.z + groundLevel;
        }
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Ground level is updated successfully.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Ground is not added in the viewer or it is undefined.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Update a skybox size according to loaded models in the added 3D Viewer
   * @param {boolean} update If the true value is passed then updates the skybox size. If a false value is passed then update skybox will set to default size. 
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  updateSkybox(update) {
    try {
      if (this.sky != undefined || this.sky != null) {
        if (update) {
          var box = new THREE.Box3();
          var targetModel = [];
          this.modelScene.traverse((child) => {
            if (
              child instanceof THREE.Mesh &&
              !targetModel.includes(child.parent)
            ) {
              targetModel.push(child.parent);
              box.expandByObject(child.parent);
            }
          });
          var size = box.getSize(new THREE.Vector3());
          var maxSize = Math.max(size.x, size.y, size.z) * 10000;
          this.sky.scale.setScalar(maxSize);
        } else {
          this.sky.scale.setScalar(this.sceneScale);
        }
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Skybox size updated successfully.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Sky texture is not added in viewer or it is undefined.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Clear all the 3D Viewer including loaded models, added labels, ground and hemisphere light.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  clearAll() {
    try {
      const currentViewer = this;
      if (this.modelScene.children != []) {
        var object = this.modelScene;
        if (object instanceof THREE.Object3D) {
          object.traverse(function (mesh) {
            if (mesh instanceof THREE.Mesh) {
              mesh.geometry.dispose();
              mesh.geometry = null;
              if (mesh.material.length != undefined) {
                if (mesh.material.length > 0) {
                  for (var i = 0; i < mesh.material.length; i++) {
                    if (mesh.material[i].map) {
                      mesh.material[i].map.dispose();
                    }
                    mesh.material[i].dispose();
                  }
                }
              } else {
                if (mesh.material.map) {
                  mesh.material.map.dispose();
                }
                mesh.material.dispose();
              }
            }
          });
        }
        this.scene.remove(this.modelScene);
        this.modelScene = new THREE.Object3D();
        this.scene.add(this.modelScene);
        this.isModelDisposed = true;
        // removed ground and hemisphere light
        this.scene.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.name == 'sceneGround')
            this.scene.remove(child);
          if (child instanceof THREE.HemisphereLight && child.name == 'hemisphereLight')
            this.scene.remove(child);
        });
        let labelDiv = document.getElementById('labels')
        while (labelDiv.firstChild) {
          labelDiv.firstChild.remove();
        }
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Model is disposed and Memory is cleared.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is already disposed.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Add a fog in the added 3D Viewer
   * @param {boolean} active Added or remove the fog on passed boolean value
   * @param {number} intensity Set the fog intensity in the 3D Viewer
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  setSceneFog(active, intensity) {
    try {
      if (this.scene.fog != undefined) {
        if (this.scene.fog) this.scene.fog = null;
        var sceneFog = new THREE.Fog(this.backgroundColor, intensity, this.camera.position.y); // 0xefd1b5
        if (active) this.scene.fog = sceneFog;
        else this.scene.fog = null;
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Fog is added in viewer successfully.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Fog is undefined.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Enable or disable the multiple selection functionality
   * @param {boolean} status If passed true value then enable the multiple functionality If passed false value then disable the multiple selection functionality and set to the single element selection
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  multiSelection(status) {
    try {
      if (status != undefined || status != null) {
        this.multipleSelectionFlagCheck = status;
        this.clearPickSelection(true);
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Multiple selection enabled successfully.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Status value is either undefined or null.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Enable or disable the highlighting functionality
   * @param {boolean} status If passed true value then enable highlighting. If passed false value then disable the highlighting functionality
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  highlightCheck(status) {
    try {
      if (status != undefined || status != null) {
        this.highlightElementFlagCheck = status;
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Highlighting enabled successfully.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Status is either undefined or null.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  // raycast setup
  raycastSetup(event) {
    const rendererContext = this.renderer.getContext();
    var canvasBounds = rendererContext.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
    this.mouse.y = -((event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.layers.set(1);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.render();
  }

  // selection event
  pickElement(event, callBack) {
    try {
      if (!this.isDragged) {
        if ((event != undefined || event != null) && (callBack != undefined || callBack != null)) {
          this.raycastSetup(event);
          if (!this.multipleSelectionFlagCheck) {
            this.clearPickSelection(true);
          }
          var intersected = this.raycaster.intersectObject(this.modelScene, true);
          if (intersected.length > 0) {
            this.applySelectionMaterial(intersected[0].object.name);
            callBack(intersected[0].object.name);
          } else {
            this.clearPickSelection(true);
            callBack('');
          }
          this.render();
          var returnValue = {
            'status': 'success',
            'message': 'Element selected successfully.'
          }
          return returnValue;
        }
        else {
          var returnValue = {
            'status': 'failed',
            'message': 'ERROR : Event or callback is either undefined or null.'
          }
          return returnValue;
        }
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  // apply selection material
  applySelectionMaterial(objectName) {
    const currentViewer = this;
    currentViewer.modelScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name == objectName) {
        var pickTempMaterial = child.material.clone();
        pickTempMaterial.color.setHex(currentViewer.pickColor);
        child.userData.selectMaterial = pickTempMaterial;
        child.material = pickTempMaterial;
        currentViewer.intersectedArray.push(child);
        // currentViewer.setOutlinePass(element);
      }
    });
    currentViewer.render();
  }

  // apply selection material
  clearPickSelection(render = false) {
    try {
      if (this.intersectedArray.length >= 1) {
        this.intersectedArray.forEach((element) => {
          if (element.userData.colorMaterial != undefined) {
            element.material = element.userData.colorMaterial;
          } else {
            this.model.forEach((models) => {
              if (element.name == models.name) {
                if (element.userData.opacity != undefined) {
                  element.material.color.setHex(models.material.color.getHex());
                } else {
                  element.material = models.material;
                }
              }
            });
          }
          element.userData.selectMaterial = undefined;
        });
        this.intersectedArray = [];
        if (render) {
          this.render();
        }
        var returnValue = {
          'status': 'success',
          'message': 'Cleared the selected element.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Select the element from loaded model.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  // highlight event
  highlightElement(event, callBack) {
    try {
      if (event.buttons == 0) {
        if ((event != undefined || event != null) && (callBack != undefined || callBack != null)) {
          this.raycastSetup(event);
          if (this.highlightElementFlagCheck) {
            this.clearHighlights();
            var intersected = this.raycaster.intersectObject(this.modelScene, true);
            if (intersected.length > 0) {
              this.applyHighlightMaterial(intersected[0].object.name, true);
              callBack(intersected[0].object.name);
            }
          }
          this.render();
          var returnValue = {
            'status': 'success',
            'message': 'Element is highlighted successfully.'
          }
          return returnValue;
        }
        else {
          var returnValue = {
            'status': 'failed',
            'message': 'ERROR : Event or callback is either undefined or null.'
          }
          return returnValue;
        }
      }
      else {
        this.isDragged = true;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  // apply highlight material
  applyHighlightMaterial(objectName, render = false) {
    const currentViewer = this;
    currentViewer.modelScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name == objectName) {
        var highlightTempMaterial = child.material.clone();
        highlightTempMaterial.color.setHex(currentViewer.hightlightColor);
        child.material = highlightTempMaterial;
        currentViewer.highLightArray.push(child);
      }
    });
    if (render) {
      currentViewer.render();
    }
  }

  /**
   * Clear the highlighted element
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  clearHighlights() {
    try {
      if (this.highLightArray.length >= 1) {
        this.highLightArray.forEach((element) => {
          if (element.userData.selectMaterial != undefined) {
            element.material = element.userData.selectMaterial;
          } else if (element.userData.colorMaterial != undefined) {
            element.material = element.userData.colorMaterial;
          } else {
            this.model.forEach((models) => {
              if (element.name == models.name) {
                if (element.userData.opacity != undefined) {
                  element.material.color.setHex(models.material.color.getHex());
                } else {
                  element.material = models.material;
                }
              }
            });
          }
        });
        this.highLightArray = [];
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Cleared the highlighted element.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Highlight the element from loaded model.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  // edge visibility for single and multiple selection element
  setOutlinePass(entity) {
    this.lastSelectedElement = entity;
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
    this.outlinePass.visibleEdgeColor = new THREE.Color(1, 0, 0);
    this.outlinePass.pulsePeriod = 0;
    this.outlinePass.edgeGlow = 1;
    this.outlinePass.edgeThickness = 1;
    this.outlinePass.edgeStrength = 3;
    this.composer.addPass(this.outlinePass);
    this.outlinePass.selectedObjects = [this.lastSelectedElement];
    this.render();
  }

  /**
   * Return the array of selected element IDs.
   * The returned array must be handled at the consumer side
   * @returns {number[]} Returns the array of selected element IDs
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  getSelected() {
    try {
      if (this.intersectedArray.length >= 1) {
        var arrayElements = [];
        this.intersectedArray.forEach((i) => {
          arrayElements.push(i.name);
        });
        this.render();
        return arrayElements;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Select the element from loaded model.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Clear the selected elements
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  clearSelection() {
    var response = this.clearPickSelection(true);
    this.render();
    return response;
  }

  /**
   * Show or hide the single element
   * @param {any} element_ID Pass the element id from the loaded model in 3D viewer
   * @param {boolean} status If passed true value then shows the element. If passed false value then hides the element
   * @param {boolean} render If passed true value then executes the functionality. If a false value is passed, then functionality will not be executed. Default value is false.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  showElement(element_ID, status, render = false) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && child.name == element_ID) {
            currentViewer.lockElement(child.name, !status, true);
            child.visible = status;
          }
        });
        if (render) {
          currentViewer.render();
        }
        var returnValue = {
          'status': 'success',
          'message': 'Show element API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Load the model in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Isolate the single element
   * @param {any} element_ID Pass the element id from the loaded model in the 3d Viewer
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  isolateElement(element_ID) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && child.name != element_ID) {
            currentViewer.showElement(child.name, false, true);
          }
        });
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Isolate element API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Load the model in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Lock or unlock the single element.
   * If locked the element then it wont get selected and highlighted
   * If unlocked the element then it will get selected and highlighted
   * @param {any} element_ID The element_ID parameter take element id of the loaded model
   * @param {boolean} status The status parameter lock or unlock the single element
   * @param {boolean} render The render parameter executes the functionality if sets to true
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  lockElement(element_ID, status, render = false) {
    try {
      if (this.modelScene.children.length != 0) {
        this.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && child.name == element_ID) {
            if (status) {
              child.layers.disable(1);
              child.layers.enable(2);
            } else {
              child.layers.disable(2);
              child.layers.enable(1);
            }
          }
        });
        if (render) {
          this.render();
        }
        var returnValue = {
          'status': 'success',
          'message': 'Lock element API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Load the model in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Lock or unlock the multiple elements
   * If locked the multiple elements then it wont get selected and highlighted
   * If unlocked the multiple elements then it will get selected and highlighted
   * @param {any[]} element_Ids Passed the array of element id from the loaded model in the 3D Viewer
   * @param {boolean} status If passed true value then lock the multiple elements. If passed false value then unlock the multiple elements
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  lockElements(element_Ids, status) {
    try {
      var array = [];
      element_Ids.forEach((element) => {
        array.push(element);
      });
      if (this.modelScene.children.length != 0) {
        array.forEach((element) => {
          this.lockElement(element, status, true);
        });
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Lock elements API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Load the model in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Add a label to single element
   * @param {any} element_ID Pass the element id from the loaded model in 3D Viewer
   * @param {string} label Pass the label for single element
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  labelElement(element_ID, label) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && child.name == element_ID) {
            var box = new THREE.Box3();
            box.setFromObject(child);
            var center = box.getCenter(new THREE.Vector3());
            currentViewer.labelVarible.push({
              objectName: child.name,
              labels: currentViewer.makeInstance(label, element_ID),
              labelCenter: center,
            });
          }
        });
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Label element API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Load the model in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  // update the label
  labelUpdate() {
    this.labelVarible.forEach((object) => {
      let tempV = new THREE.Vector3();
      tempV.x = object.labelCenter.x;
      tempV.y = object.labelCenter.y;
      tempV.z = object.labelCenter.z;
      tempV.project(this.camera);
      const x = ((tempV.x * 0.5 + 0.5) * this.canvas.clientWidth) + this.canvas.offsetLeft;
      const y = ((tempV.y * -0.5 + 0.5) * this.canvas.clientHeight) + this.canvas.offsetTop;
      object.labels.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
    });
  }

  makeInstance(name, element_id) {
    const labelContainerElem = document.querySelector('#labels');
    const elem = document.createElement('div');
    elem.id = element_id;
    elem.textContent = name;
    labelContainerElem.appendChild(elem);
    return elem;
  }

  /**
   * Add multiple labels to the multiple elements
   * @param {any[]} element_Ids Pass the array of element id from the loaded model in 3D Viewer
   * @param {string[]} labels Pass the array of labels for multiple elements
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  labelElements(element_Ids, labels) {
    try {
      var elementArray = [],
        labelArray = [];
      element_Ids.forEach((element) => {
        elementArray.push(element);
      });
      labels.forEach((label) => {
        labelArray.push(label);
      });
      if (this.modelScene.children.length != 0 && elementArray.length == labelArray.length) {
        for (let i = 0; i < elementArray.length; i++) {
          this.labelElement(elementArray[i], labelArray[i]);
        }
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Label elements API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Either model is not loaded in viewer or element id array and label array is not same.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Remove a label from a single element
   * @param {any} element_ID Pass the element id from the loaded model in 3D viewer
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  removeLabel(element_ID) {
    try {
      let labelArr = [];
      labelArr.push(element_ID);
      this.removeLabels(labelArr);
      this.render();
      var returnValue = {
        'status': 'success',
        'message': 'Removed label API'
      }
      return returnValue;
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Remove multiple labels from the multiple elements
   * @param {any[]} element_ID Pass the array of element id from the loaded model in 3D Viewer
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  removeLabels(element_ID) {
    try {
      const currentViewer = this;
      for (let j = 0; j < element_ID.length; j++) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            var label = document.querySelector('#labels');
            for (let i = 0; i < label.children.length; i++) {
              if (label.children[i].id == element_ID[j]) {
                label.removeChild(label.children[i]);
              }
            }
          }
        });
      }
      currentViewer.labelVarible.forEach((object) => {
        if (element_ID == object.objectName) {
          let index = currentViewer.labelVarible.indexOf(object);
          currentViewer.labelVarible.splice(index, 1);
        }
      });
      currentViewer.render();
      var returnValue = {
        'status': 'success',
        'message': 'Removed labels API'
      }
      return returnValue;
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Focused to the single element
   * @param {any} element_ID Pass the element id from the loaded model in 3D Viewer
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  zoomSelection(element_ID) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0) {
        var array = [];
        var box = new THREE.Box3();
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && child.name == element_ID) {
            array.push(child);
          }
        });
        var zoomGroup = new THREE.Group();
        array.forEach((object) => {
          zoomGroup.add(object);
        });
        currentViewer.scene.add(zoomGroup);
        box.setFromObject(zoomGroup);
        var vector = box.max.distanceTo(box.min);
        var center = box.getCenter(new THREE.Vector3());
        var y_distance = vector * 1.1 + center.y;
        currentViewer.camera.position.set(center.x, y_distance, center.z);
        currentViewer.camera.lookAt(center.x, center.y, center.z);
        currentViewer.orbitControls.target.set(center.x, center.y, center.z);
        currentViewer.camera.updateProjectionMatrix();
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Zoom selection API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Focused the multiple elements
   * @param {any[]} element_Ids Pass the array of element id from the loaded model in 3D Viewer
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  zoomToElements(element_Ids) {
    try {
      if (this.modelScene.children.length != 0) {
        var array = [];
        element_Ids.forEach((element) => {
          this.modelScene.traverse(function (child) {
            if (child instanceof THREE.Mesh && child.name == element) {
              array.push(child);
            }
          });
        });
        var zoomGroup = new THREE.Group();
        array.forEach((object) => {
          zoomGroup.add(object);
        });
        this.modelScene.add(zoomGroup);
        var box = new THREE.Box3();
        box.setFromObject(zoomGroup);
        var vector = box.max.distanceTo(box.min);
        var center = box.getCenter(new THREE.Vector3());
        // var y_distance = vector * 0.8 + center.y;
        var y_distance = vector * 1.1 + center.y;
        this.camera.position.set(center.x, y_distance, center.z);
        this.camera.lookAt(center.x, center.y, center.z);
        this.orbitControls.target.set(center.x, center.y, center.z);
        this.camera.updateProjectionMatrix();
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Zoom to elements API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Set the opacity of the single element
   * @param {any} element_ID Pass the element id from the loaded model in 3D Viewer
   * @param {number} opacity Pass opacity value to single element
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  setElementOpacity(element_ID, opacity) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0 && 0.0 <= opacity <= 1.0) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && child.name == element_ID) {
            currentViewer.opacityTempMaterial = child.material.clone();
            currentViewer.opacityTempMaterial.transparent = true;
            currentViewer.opacityTempMaterial.opacity = opacity;
            child.material = currentViewer.opacityTempMaterial;
            child.userData.opacity = opacity;
          }
        });
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Element Opacity API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Either model is not loaded in viewer or opacity is not between 0.0 to 1.0.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Set the opacity of multiple elements
   * @param {any[]} element_Ids Pass the array of element id from the loaded model in 3D Viewer
   * @param {number} opacity Pass opacity value to multiple elements
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  setOpacity(element_Ids, opacity) {
    try {
      var elementArray = [];
      element_Ids.forEach((element) => {
        elementArray.push(element);
      });
      if (this.modelScene.children.length != 0 && elementArray.length >= 1) {
        for (let i = 0; i < elementArray.length; i++) {
          this.setElementOpacity(elementArray[i], opacity);
        }
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Set opacity API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Either model is not loaded in viewer or element id is zero.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Select the single element
   * @param {any} element_id Pass the element id from the loaded model in 3D Viewer
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  selectElement(element_id) {
    try {
      const currentViewer = this;
      currentViewer.clearPickSelection(true);
      if (currentViewer.modelScene.children.length != 0) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && child.name == element_id) {
            currentViewer.applySelectionMaterial(child.name);
          }
        });
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Selected element API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Select the multiple elements
   * @param {any[]} element_Ids Pass the array of element id from the loaded model in 3D viewer
   * @param {boolean} clear If passed true value then clears already selected element. If a false value is selected then the selected element remains selected.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  selectElements(element_Ids, clear) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0) {
        if (clear) {
          currentViewer.clearPickSelection(true);
        }
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && element_Ids.includes(child.name)) {
            currentViewer.applySelectionMaterial(child.name);
          }
        });
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Select element API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Highlight the single element
   * @param {any} element_id Pass the element id from the loaded model in 3D Viewer
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  highlightedElement(element_id) {
    try {
      const currentViewer = this;
      currentViewer.clearHighlights();
      if (currentViewer.modelScene.children.length != 0) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && child.name == element_id) {
            currentViewer.applyHighlightMaterial(child.name, true);
          }
        });
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Highlighted element API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Apply custom color on the single element
   * @param {any} element_ID Pass the element id from the loaded model in 3D Viewer
   * @param {any} color Pass the Hex Color Code to applied on single element
   * @param {boolean} render If passed true value then executes the functionality. If a false value is passed then functionality will not be executed. Default value is false.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  colorElement(element_ID, color, render = false) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && child.name == element_ID) {
            if (child.userData.colorMaterial) {
              if (child.userData.colorMaterial.userData.opacity) {
                currentViewer.model.forEach((models) => {
                  if (child.name == models.name) {
                    child.material.transparent = false;
                    child.material.opacity = models.material.opacity;
                  }
                });
              }
            }
            var colorTempMaterial = child.material.clone();
            colorTempMaterial.color.setHex(color);
            child.userData.colorMaterial = colorTempMaterial;
            child.material = colorTempMaterial;
          }
        });
        if (render) { currentViewer.render(); }
        var returnValue = {
          'status': 'success',
          'message': 'Color element API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Reset the applied custom color from the single element
   * @param {any} element_ID Pass element id from the loaded model in 3D Viewer
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  resetColor(element_ID) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && child.name == element_ID) {
            currentViewer.resetElement(child.name, true);
          }
        });
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Reset color API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Resets all the applied custom colors from model
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  resetAllColors() {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            currentViewer.resetElement(child.name, true);
          }
        });
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Reset all colors API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Apply the custom colors on multiple elements
   * @param {any[]} element_Ids Pass the array of element id from the loaded model in 3D Viewer
   * @param {any[]} colors Pass the array of Hex Color Code to apply on multiple elements
   * @param {boolean} hide If passed true then hides all filtered elements. If passed false the apply ghost color on the filtered elements
   * @param {boolean} showAll Show or hide the elements from loaded model in 3D Viewer
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  colorElements(element_Ids, colors, hide, showAll = false) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0) {
        for (let i = 0; i < element_Ids.length; i++) {
          currentViewer.colorElement(element_Ids[i], colors[i], true);
        }
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && !element_Ids.includes(child.name)) {
            if (hide) {
              currentViewer.resetElement(child.name, true);
              currentViewer.showElement(child.name, false, true);
            } else {
              if (showAll) {
                if (!child.visible) {
                  child.visible = true;
                }
              }
              var ghostMaterial = child.material.clone();
              ghostMaterial.transparent = true;
              ghostMaterial.opacity = 0.25;
              ghostMaterial.color.setHex(currentViewer.ghostColor);
              child.userData.colorMaterial = ghostMaterial;
              child.userData.colorMaterial.userData.opacity = true;
              child.material = ghostMaterial;
            }
          }
        });
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Color elements API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Isolate the multiple elements
   * @param {any[]} element_Ids Pass the array of element id from the loaded model in 3D Viewer
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  isolateElements(element_Ids) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            if (!element_Ids.includes(child.name)) {
              currentViewer.showElement(child.name, false, true);
            } else {
              currentViewer.showElement(child.name, true, true);
            }
          }
        });
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Isolate elements API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Show or hide the multiple elements
   * @param {any[]} element_Ids Pass the array of element id from the loaded model in 3D Viewer
   * @param {boolean} status If passed true value then show the elements. If passed the false value then hide the elements.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  showElements(element_Ids, status) {
    try {
      if (this.modelScene.children.length != 0) {
        element_Ids.forEach((element_id) => {
          this.showElement(element_id, status, true);
        });
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Show elements API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Reset the single element
   * @param {any} element_ID Pass the element id from the loaded model in 3D Viewer
   * @param {boolean} render If passed true value then executes the functionality. If a false value is passed then functionality will not be executed. Default value is false.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  resetElement(element_ID, render = false) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh && child.name == element_ID) {
            if (
              child.userData.selectMaterial != undefined ||
              child.userData.colorMaterial != undefined ||
              child.userData.opacity != undefined
            ) {
              currentViewer.model.forEach((models) => {
                if (child.name == models.name) {
                  child.material = models.material;
                  child.userData.selectMaterial = undefined;
                  child.userData.colorMaterial = undefined;
                  child.userData.opacity = undefined;
                }
              });
            }
          }
        });
        if (render) {
          currentViewer.render();
        }
        var returnValue = {
          'status': 'success',
          'message': 'Reset element API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Show or hide the loaded model
   * @param {boolean} status If passed true value then show the loaded model. If passed false value then hide the loaded model.
   * @param {boolean} render If passed true value then executes the functionality. If a false value is passed then functionality will not be executed. Default value is false.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  showAll(status, render = false) {
    try {
      const currentViewer = this;
      if (currentViewer.modelScene.children.length != 0) {
        currentViewer.modelScene.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            if (status && !child.visible) {
              child.visible = status;
              currentViewer.lockElement(child.name, !status, true);
            }
            if (!status && child.visible) {
              child.visible = status;
              currentViewer.lockElement(child.name, !status, true);
            }
          }
        });
        if (render) {
          currentViewer.render();
        }
        var returnValue = {
          'status': 'success',
          'message': 'Show all API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Model is not loaded in viewer.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Set the background color of the 3D Viewer.
   * If the skybox is added in the 3D Viewer then the background color of the 3D Viewer will not be visible.
   * @param {any} backgroundColor Pass the Hex Color Code to apply the background color in the added 3D Viewer
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  setSceneBackground(backgroundColor) {
    try {
      if (this.scene != undefined || this.scene != null) {
        this.scene.background = new THREE.Color(backgroundColor);
        this.render();
        var returnValue = {
          'status': 'success',
          'message': 'Scene background color updated.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Scene is undefined or null.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  /**
   * Add a hemisphere light in the 3D Viewer.
   * @param {any} skyColor Pass the Hex Color Code to set the hemisphere light
   * @param {any} groundColor Pass the Hex Color Code to set the hemisphere light
   * @param {number} intensity Pass intensity value to set the intensity of the hemisphere light
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
  setSceneIllumination(skyColor, groundColor, intensity) {
    try {
      const currentViewer = this;
      if (currentViewer.scene != undefined || currentViewer.scene != null) {
        currentViewer.scene.children.forEach((child) => {
          if (child instanceof THREE.HemisphereLight && child.name == 'hemisphereLight')
            currentViewer.scene.remove(child);
        });
        var hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        currentViewer.scene.add(hemisphereLight);
        hemisphereLight.name = 'hemisphereLight';
        var box = new THREE.Box3().setFromObject(currentViewer.modelScene);
        var center = box.getCenter(new THREE.Vector3());
        var size = box.getSize(new THREE.Vector3());
        var maxSize = Math.max(size.x, size.y, size.z) * 1.1;
        hemisphereLight.position.set(center.x + maxSize, center.y + maxSize, center.z + maxSize);
        currentViewer.render();
        var returnValue = {
          'status': 'success',
          'message': 'Scene illumination added in viewer.'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Scene is undefined or null.'
        }
        return returnValue;
      }
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  // onCanvasResize
  onCanvasResize() {
    if (this != undefined && this.canvas != undefined) {
      this.camera.aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
      this.renderer.render(this.scene, this.camera);
    }
  }

  // cleanup the instance
  destroy() {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    this.canvas.innerHTML = '';
  }

  render() {
    this.orbitControls.update();
    this.labelUpdate();
    this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}
export { Viewer };