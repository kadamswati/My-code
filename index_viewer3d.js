import { FileLoader } from '/node_modules/@ttcorestudio/viewer_3d/library_files/FileLoader.js';
import viewerMgrInstance from '/node_modules/@ttcorestudio/viewer_3d/library_files/ViewerMgr.js';

init();

function init() {
  // customViewerSettings
  let customViewerSettings = {
    backgroundColor: 0x0000ff,
    pickColor: 0x00ff00,
    highlightColor: 0xff0000,
    ghostColor: 0xea1458,
    elevation: 15,
    azimuth: 0,
    sceneScale: 250000,
    enableSSAOPass: true,
    // enableSAOPass: false
  };

  let response, canvas, viewerInstance, fileLoaderInstance, canvas1, viewerInstance1, fileLoaderInstance1;

  // first viewer instance
  canvas = document.getElementById('canvas');
  response = viewerMgrInstance.addViewer(canvas, 'canvas', { enableSSAOPass: false });
  if (response['status'] == 'success') {
    viewerInstance = viewerMgrInstance.getViewerByName('canvas');
    viewerInstance.registerEvent('element-select', (elementID) => { console.log('Select :', elementID); });
    viewerInstance.registerEvent('element-highlight', (elementID) => { console.log('Highlight :', elementID) });
  }

  // second viewer instance
  canvas1 = document.getElementById('canvas1');
  response = viewerMgrInstance.addViewer(canvas1, 'canvas1', customViewerSettings);
  if (response['status'] == 'success') {
    viewerInstance1 = viewerMgrInstance.getViewerByName('canvas1');
    viewerInstance1.registerEvent('element-select', (elementID) => { console.log('Select :', elementID); });
    viewerInstance1.registerEvent('element-highlight', (elementID) => { console.log('Highlight :', elementID); });
  }

  // file loading in both viewers
  fileLoaderInstance = new FileLoader(viewerInstance);
  fileLoaderInstance1 = new FileLoader(viewerInstance1);

  document.getElementById('get_file').onclick = function () {
    document.getElementById('my_file').click();
    document.getElementById('my_file').onchange = (event) => {
      fileLoaderInstance.addModel(event.target.files);
      fileLoaderInstance1.addModel(event.target.files);
      event.target.value = "";
    }
  }

  // single and multiple selection
  let multiSelectionFlag = false;
  let multiselection_btn = document.getElementById('multiselection_btn');
  if (viewerInstance != undefined && viewerInstance1 != undefined) {
    multiselection_btn.onclick = function (event) {
      multiSelectionFlag = !multiSelectionFlag;
      if (multiSelectionFlag == true) {
        multiselection_btn.style.backgroundColor = '#080';
        multiselection_btn.style.color = '#fff';
        viewerInstance.multiSelection(multiSelectionFlag);
        viewerInstance1.multiSelection(multiSelectionFlag);
      } else {
        multiselection_btn.style.backgroundColor = '#fff';
        multiselection_btn.style.color = '#000';
        viewerInstance.multiSelection(multiSelectionFlag);
        viewerInstance1.multiSelection(multiSelectionFlag);
      }
    };

    // highlight element
    let highlightElementFlag = false;
    let highlightElement_btn = document.getElementById('highlightElement_btn');
    highlightElement_btn.onclick = function (event) {
      highlightElementFlag = !highlightElementFlag;
      if (highlightElementFlag == true) {
        highlightElement_btn.style.backgroundColor = '#080';
        highlightElement_btn.style.color = '#fff';
        viewerInstance.highlightCheck(true);
        viewerInstance1.highlightCheck(true);
      } else {
        highlightElement_btn.style.backgroundColor = '#fff';
        highlightElement_btn.style.color = '#000';
        viewerInstance.highlightCheck(false);
        viewerInstance1.highlightCheck(false);
      }
    };

    // get selected element array
    document.getElementById('getSelected_btn').onclick = function (event) {
      console.log(viewerInstance.getSelected());
      console.log(viewerInstance1.getSelected());
    };

    // clear the selection
    document.getElementById('clearSelection_btn').onclick = function (event) {
      viewerInstance.clearSelection();
      viewerInstance1.clearSelection();
    };

    // color elements
    document.getElementById('colorElements_btn').onclick = function (event) {
      viewerInstance.colorElements(['c49fb3d1-c1fb-45ce-8ac5-e902335de96e', '9ff72d49-fe6b-402b-ae9f-aead939fa137'], [0xff0000, 0x00ff00], true);
      viewerInstance1.colorElements(['c49fb3d1-c1fb-45ce-8ac5-e902335de96e', '9ff72d49-fe6b-402b-ae9f-aead939fa137'], [0x0000ff, 0x00ffff], false);

      // viewerInstance.colorElement('9ff72d49-fe6b-402b-ae9f-aead939fa137', 0x0000ff, true);
      // viewerInstance1.colorElement('c49fb3d1-c1fb-45ce-8ac5-e902335de96e', 0xffff00, true);
    }

    // show 
    document.getElementById('showElements_btn').onclick = function (event) {
      viewerInstance.showElements(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e'], false);
      viewerInstance1.showElements(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e'], false);

      // viewerInstance.showElement('c49fb3d1-c1fb-45ce-8ac5-e902335de96e', false, true);
      // viewerInstance1.showElement('9ff72d49-fe6b-402b-ae9f-aead939fa137', false, true);
    };

    // isolate 
    document.getElementById('isolateElements_btn').onclick = function (event) {
      viewerInstance.isolateElements(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e']);
      viewerInstance1.isolateElements(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e']);

      // viewerInstance.isolateElement('c49fb3d1-c1fb-45ce-8ac5-e902335de96e');
      // viewerInstance1.isolateElement('9ff72d49-fe6b-402b-ae9f-aead939fa137');
    };

    // opacity
    document.getElementById('opacityElements_btn').onclick = function (event) {
      viewerInstance.setOpacity(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e'], 0.2);
      viewerInstance1.setOpacity(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e'], 0.65);

      // viewerInstance.setElementOpacity('c49fb3d1-c1fb-45ce-8ac5-e902335de96e', 0.2);
      // viewerInstance1.setElementOpacity('9ff72d49-fe6b-402b-ae9f-aead939fa137', 0.65);
    };

    // label 
    document.getElementById('labelElements_btn').onclick = function (event) {
      viewerInstance.labelElements(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e'], ['label1', 'label2']);
      viewerInstance1.labelElements(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e'], ['label3', 'label4']);

      // viewerInstance.labelElements(['312e24b6-c5bc-4e1f-9789-ab3278db96e7-00053dcd', ' 312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054392'], ['viewer-1.1', 'viewer-1.2']);

      // viewerInstance.labelElement('c49fb3d1-c1fb-45ce-8ac5-e902335de96e', 'viewer-1');
      // viewerInstance1.labelElement('9ff72d49-fe6b-402b-ae9f-aead939fa137', 'viewer-2');
    };

    // remove label 
    document.getElementById('removeLabels_btn').onclick = function (event) {
      // viewerInstance.removeLabels(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e']);
      // viewerInstance1.removeLabels(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e']);

      viewerInstance.removeLabel('c49fb3d1-c1fb-45ce-8ac5-e902335de96e');
      viewerInstance1.removeLabel('9ff72d49-fe6b-402b-ae9f-aead939fa137');
    };

    // lock 
    document.getElementById('lockElements_btn').onclick = function (event) {
      viewerInstance.lockElements(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e'], true);
      viewerInstance1.lockElements(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e'], true);

      // viewerInstance.lockElement('c49fb3d1-c1fb-45ce-8ac5-e902335de96e', true, true);
      // viewerInstance1.lockElement('9ff72d49-fe6b-402b-ae9f-aead939fa137', true, true);
    };

    // reset element material to original material-single element
    document.getElementById('resetElement_btn').onclick = function (event) {
      viewerInstance.resetElement('c49fb3d1-c1fb-45ce-8ac5-e902335de96e', true);
      viewerInstance1.resetElement('9ff72d49-fe6b-402b-ae9f-aead939fa137', true);
    };

    // reset color
    document.getElementById('resetColor_btn').onclick = function (event) {
      viewerInstance.resetColor('c49fb3d1-c1fb-45ce-8ac5-e902335de96e');
      viewerInstance1.resetColor('9ff72d49-fe6b-402b-ae9f-aead939fa137');
    };

    // reset all colors
    document.getElementById('resetAllColors_btn').onclick = function (event) {
      viewerInstance.resetAllColors();
      viewerInstance1.resetAllColors();
    };

    // showing or hiding elements-all elements (whole model)
    document.getElementById('showAll_btn').onclick = function (event) {
      viewerInstance.showAll(false, true);
      viewerInstance1.showAll(false, true);
    };

    document.getElementById('zoomElements_btn').onclick = function (event) {
      // viewerInstance.zoomToElements(['9fd6eb9d-ee4d-438c-9edc-055a67306c3d', '25fa50c4-0c76-4dae-8e7f-15fc09e9f6cc']);
      // viewerInstance1.zoomToElements(['25fa50c4-0c76-4dae-8e7f-15fc09e9f6cc', 'b727e0d2-787b-4a18-9976-0919ebd51f46']);

      viewerInstance.zoomSelection('9fd6eb9d-ee4d-438c-9edc-055a67306c3d');
      viewerInstance1.zoomSelection('9fd6eb9d-ee4d-438c-9edc-055a67306c3d');
    }

    // zoom to model
    document.getElementById('zoomExtents_btn').onclick = function (event) {
      fileLoaderInstance.zoomExtents();
      fileLoaderInstance1.zoomExtents();
    };

    // select element through API
    document.getElementById('selectElements_btn').onclick = function (event) {
      viewerInstance.selectElements(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e'], true);
      viewerInstance1.selectElements(['9ff72d49-fe6b-402b-ae9f-aead939fa137', 'c49fb3d1-c1fb-45ce-8ac5-e902335de96e'], false);

      // viewerInstance.selectElement('c49fb3d1-c1fb-45ce-8ac5-e902335de96e');
      // viewerInstance1.selectElement('9ff72d49-fe6b-402b-ae9f-aead939fa137');
    };

    // highlight element through API
    document.getElementById('highlightedElement_btn').onclick = function (event) {
      viewerInstance.highlightedElement('c49fb3d1-c1fb-45ce-8ac5-e902335de96e');
      viewerInstance1.highlightedElement('9ff72d49-fe6b-402b-ae9f-aead939fa137');
    };

    // clear highlighted element
    document.getElementById('clearHighlightedElements_btn').onclick = function (event) {
      viewerInstance.clearHighlights();
      viewerInstance1.clearHighlights();
    };

    document.getElementById('updateElevation').onclick = function (event) {
      let value = prompt("Enter elevation angle : ");
      viewerInstance.updateElevation(parseFloat(value));
      viewerInstance1.updateElevation(parseFloat(value));
    }

    document.getElementById('updateAzimuth').onclick = function (event) {
      let value = prompt("Enter azimuth angle : ");
      viewerInstance.updateAzimuth(parseFloat(value))
      viewerInstance1.updateAzimuth(parseFloat(value));
    }

    document.getElementById('setSceneGround_btn').onclick = function (event) {
      viewerInstance.setSceneGround(true, 0xababab, 0.67, 1000);
      viewerInstance1.setSceneGround(true, 0xefefef, 1, 1000);
    }

    // update ground level
    document.getElementById('groundLevel_btn').onclick = function (event) {
      viewerInstance.updateGroundLevel(parseFloat(100));
      viewerInstance1.updateGroundLevel(parseFloat(-51.56));
    };

    document.getElementById('setSceneFog_btn').onclick = function (event) {
      viewerInstance.setSceneFog(true, 0.5);
      viewerInstance1.setSceneFog(true, 1);
    }

    document.getElementById('setSceneIllumination_btn').onclick = function (event) {
      viewerInstance.setSceneIllumination(0x35d6ed, 0x9b7653, 1);
      viewerInstance1.setSceneIllumination(0xc9f6ff, 0x684132, 1);
    }

    // update skybox
    document.getElementById('updateSkybox_btn').onclick = function (event) {
      viewerInstance.updateSkybox(true);
      viewerInstance1.updateSkybox(true);
    };

    // clear viewer by name
    document.getElementById('clearByName_btn').onclick = function (event) {
      viewerMgrInstance.clearViewerByName('canvas');
    };

    // clear all viewers
    document.getElementById('clearAll_btn').onclick = function (event) {
      viewerMgrInstance.clearAllViewers();
    };

    // translate model
    document.getElementById('translateModel_btn').onclick = function (event) {
      viewerInstance.translateModel('scene1.obj', -22, 22, 22);
      viewerInstance1.translateModel('scene.glb', 22, 22, 22);
    }

    // rotate model
    document.getElementById('rotateModel_btn').onclick = function (event) {
      viewerInstance.rotateModel('scene1.obj', 5, 5, 5);
      viewerInstance1.rotateModel('scene.glb', 5, 5, 5);
    }

    // scale model
    document.getElementById('scaleModel_btn').onclick = function (event) {
      viewerInstance.scaleModel('scene1.obj', 2);
      viewerInstance1.scaleModel('scene.glb', 2);
    }

    // clip model
    document.getElementById('clipModel_btn').onclick = function (event) {
      viewerInstance.clipModelOnGlobalLevel('scene1.obj', 0.2, 0.8, 0, 1, 0, 1);
      viewerInstance1.clipModelOnLocalLevel('scene1.obj', true, 0, 1, 0.1, 0.9, 0, 1);

      // viewerInstance.clipModelOnGlobalLevel('SolidMeshModel_Unwelded.3dm', 0.2, 0.8, 0, 1, 0, 1);
      // viewerInstance1.clipModelOnLocalLevel('SolidMeshModel_Unwelded.3dm', true, 0.2, 0.9, 0, 1, 0, 1);
    }

    const input = document.querySelector("#slider");
    input.addEventListener("input", (event) => {
      let sliderValue = parseFloat(event.target.value);
      viewerInstance.clipModelOnGlobalLevel('scene1.obj', sliderValue, 0.9, 0, 1, 0, 1);
      viewerInstance1.clipModelOnLocalLevel('scene1.obj', true, sliderValue, 0.9, 0, 1, 0, 1);

      // viewerInstance.clipModelOnGlobalLevel('SolidMeshModel_Unwelded.3dm', sliderValue, 0.8, 0, 1, 0, 1);
      // viewerInstance1.clipModelOnLocalLevel('SolidMeshModel_Unwelded.3dm', true, sliderValue, 0.9, 0, 1, 0, 1);
    });

    // document.getElementById('updateSSAOPass').onclick = function (event) {
    //   viewerInstance.updateSSAOPass({
    //     kernelRadius: 500,
    //     minDistance: 0.5,
    //     maxDistance: 10
    //   });
    //   viewerInstance1.updateSSAOPass({
    //     kernelRadius: 500,
    //     minDistance: 0.5,
    //     maxDistance: 10
    //   });
    // };

    document.getElementById('addSSAOPass').onclick = function (event) {
     // viewerInstance.addSSAOPass(false);
      viewerInstance1.addSSAOPass(true);
    }

    const kernelRadius = document.querySelector("#kernelRadius");
    kernelRadius.addEventListener("input", (event) => {
      let kernelRadiusValue = parseFloat(event.target.value);
      viewerInstance.updateSSAOPass({ kernelRadius: kernelRadiusValue });
      viewerInstance1.updateSSAOPass({ kernelRadius: kernelRadiusValue });
    });

    const minDistance = document.querySelector("#minDistance");
    minDistance.addEventListener("input", (event) => {
      let minDistanceValue = parseFloat(event.target.value);
      viewerInstance.updateSSAOPass({ minDistance: minDistanceValue });
      viewerInstance1.updateSSAOPass({ minDistance: minDistanceValue });
    });

    const maxDistance = document.querySelector("#maxDistance");
    maxDistance.addEventListener("input", (event) => {
      let maxDistanceValue = parseFloat(event.target.value);
      viewerInstance.updateSSAOPass({ maxDistance: maxDistanceValue });
      viewerInstance1.updateSSAOPass({ maxDistance: maxDistanceValue });
    });

    // document.getElementById('updateSAOPass').onclick = function (event) {
    //   viewerInstance.updateSAOPass({
    //     saoBias: 0.87,
    //     saoIntensity: 0.028,
    //     saoScale: 8.8,
    //     saoKernelRadius: 100,
    //     saoMinResolution: 0,
    //     saoBlur: true,
    //     saoBlurRadius: 8,
    //     saoBlurStdDev: 4,
    //     saoBlurDepthCutoff: 0.01
    //   });
    //   viewerInstance1.updateSAOPass({
    //     saoBias: 0.87,
    //     saoIntensity: 0.028,
    //     saoScale: 8.8,
    //     saoKernelRadius: 100,
    //     saoMinResolution: 0,
    //     saoBlurRadius: 8,
    //     saoBlurStdDev: 4,
    //     saoBlurDepthCutoff: 0.01
    //   });
    // };

    document.getElementById('removeSSAOPass').onclick = function (event) {
      viewerInstance.removeSSAOPass(true);
      viewerInstance1.removeSSAOPass(true);
    }

    document.getElementById('switchEdgeGeom').onclick = function (event) {
      // let value = prompt("Enter true or false value : ");
      // if (value == 'true') value = true;
      // if (value == 'false') value = false;
      viewerInstance.switchToEdgeGeometry('scene1.obj', 10, true);
      viewerInstance1.switchToEdgeGeometry('scene1.obj', 2, true);
    }

    document.getElementById('testAPI').onclick = function (event) {
      // viewerInstance.updateLineGeometry();
      // viewerInstance1.updateLineGeometry();
    }
  }
}