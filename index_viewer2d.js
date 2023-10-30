import { Viewer } from '/node_modules/@ttcorestudio/viewer_2d/library_files/Viewer.js'
import { FileLoader } from './node_modules/@ttcorestudio/viewer_2d/library_files/FileLoader.js'

init();

function init() {
    let canvas, viewerInstance, fileLoader, viewerInstance1, fileLoader1;

    document.getElementById('addFirst2DViewerInstance_btn').onclick = function () {
        document.getElementById('removeFirst2DViewerInstance_btn').style.backgroundColor = '#fff';
        document.getElementById('removeFirst2DViewerInstance_btn').style.color = '#000';
        // add first viewer instance
        canvas = document.getElementById('canvas');
        viewerInstance = new Viewer();
        viewerInstance.addViewer(canvas);
        // register event on first viewer instance
        viewerInstance.registerEvent('element-select', (elementID) => { console.log('Select :', elementID); });
        viewerInstance.registerEvent('element-highlight', (elementID) => { console.log('Highlight :', elementID); });

        document.getElementById('addFirst2DViewerInstance_btn').style.backgroundColor = '#080';
        document.getElementById('addFirst2DViewerInstance_btn').style.color = '#fff';
    }

    document.getElementById('addSecond2DViewerInstance_btn').onclick = function () {
        document.getElementById('removeSecond2DViewerInstance_btn').style.backgroundColor = '#fff';
        document.getElementById('removeSecond2DViewerInstance_btn').style.color = '#000';
        // add second viewer instance with custom viewer settings
        let customViewerSettings = {
            backgroundColor: '#E5D9B6',
            pickColor: '#00FF00',
            highlightColor: '#FF0000',
            ghostColor: '#fffFFF',
            labelColor: '#0000ff',
            strokeWidth: 18,
            strokeOpacity: 1,
            filterOpacity: 0.5,
            textScale: 0.02,
            labelFontWeight: 'bold',
            labelBoxOutlineColor: 'red',
            labelBoxBackgroundColor: '#ffffff',
            labelBoxOutlineWidth: '1',
            labelSize: 'fixed'
        }
        viewerInstance1 = new Viewer(customViewerSettings);
        viewerInstance1.addViewer(document.getElementById('canvas1'));
        // register event on second viewer instance
        viewerInstance1.registerEvent('element-select', (elementID) => { console.log('Select :', elementID); });
        viewerInstance1.registerEvent('element-highlight', (elementID) => { console.log('Highlight :', elementID); });

        document.getElementById('addSecond2DViewerInstance_btn').style.backgroundColor = '#080';
        document.getElementById('addSecond2DViewerInstance_btn').style.color = '#fff';
    }

    document.getElementById('removeFirst2DViewerInstance_btn').onclick = function () {
        viewerInstance.removeViewer(canvas);
        document.getElementById('removeFirst2DViewerInstance_btn').style.backgroundColor = '#080';
        document.getElementById('removeFirst2DViewerInstance_btn').style.color = '#fff';
        document.getElementById('addFirst2DViewerInstance_btn').style.backgroundColor = '#fff';
        document.getElementById('addFirst2DViewerInstance_btn').style.color = '#000';

    }

    document.getElementById('removeSecond2DViewerInstance_btn').onclick = function () {
        viewerInstance1.removeViewer(document.getElementById('canvas1'));
        document.getElementById('removeSecond2DViewerInstance_btn').style.backgroundColor = '#080';
        document.getElementById('removeSecond2DViewerInstance_btn').style.color = '#fff';
        document.getElementById('addSecond2DViewerInstance_btn').style.backgroundColor = '#fff';
        document.getElementById('addSecond2DViewerInstance_btn').style.color = '#000';
    }

    document.getElementById('get_file_for_first_viewer').onclick = function () {
        document.getElementById('my_file_for_first_viewer').click();
        document.getElementById('my_file_for_first_viewer').onchange = (event) => {
            // load file in first viewer instance
            fileLoader = new FileLoader(viewerInstance);
            fileLoader.addModel(event.target.files);
        }
    }

    document.getElementById('get_file_for_second_viewer').onclick = function () {
        document.getElementById('my_file_for_second_viewer').click();
        document.getElementById('my_file_for_second_viewer').onchange = (event) => {
            // load file in second viewer instance
            fileLoader1 = new FileLoader(viewerInstance1);
            fileLoader1.addModel(event.target.files);
        }
    }

    let multiSelectionFlag = false;
    let multiselection_btn = document.getElementById('multiselection_btn');
    multiselection_btn.onclick = function (event) {
        multiSelectionFlag = !multiSelectionFlag;
        viewerInstance.clear_pickSelection();
        if (multiSelectionFlag == true) {
            multiselection_btn.style.backgroundColor = '#080';
            multiselection_btn.style.color = '#fff';
            viewerInstance.multiSelection(multiSelectionFlag);
            viewerInstance1.multiSelection(multiSelectionFlag);
        }
        else {
            multiselection_btn.style.backgroundColor = '#fff';
            multiselection_btn.style.color = '#000';
            viewerInstance.multiSelection(multiSelectionFlag);
            viewerInstance1.multiSelection(multiSelectionFlag);
        }
    }

    let highlightElementFlag = false;
    let highlightElement_btn = document.getElementById('highlightElement_btn');
    highlightElement_btn.onclick = function (event) {
        highlightElementFlag = !highlightElementFlag;
        viewerInstance.clear_highlightSelection();
        if (highlightElementFlag == true) {
            highlightElement_btn.style.backgroundColor = '#080';
            highlightElement_btn.style.color = '#fff';
            viewerInstance.highlightCheck(true);
            viewerInstance1.highlightCheck(true);
        }
        else {
            highlightElement_btn.style.backgroundColor = '#fff';
            highlightElement_btn.style.color = '#000';
            viewerInstance.highlightCheck(false);
            viewerInstance1.highlightCheck(false);
        }
    }

    document.getElementById('getSelected_btn').onclick = function (event) {
        console.log('Selected elements from 1st viewer : ', viewerInstance.getSelected());
        console.log('Selected elements from 2nd viewer : ', viewerInstance1.getSelected());
    }

    document.getElementById('clearSelection_btn').onclick = function (event) {
        viewerInstance.clear_pickSelection();
        viewerInstance1.clear_pickSelection();
    }

    document.getElementById('clearHighlighted_btn').onclick = function (event) {
        viewerInstance.clear_highlightSelection();
        viewerInstance1.clear_highlightSelection();
    }

    document.getElementById('colorElements_btn').onclick = function (event) {
        viewerInstance.colorElements(['g-2000127', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d'], ['#ff0000', '#00ff00', '#0000ff'], false);
        viewerInstance1.colorElements(['g-2000127', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d'], ['#ffff00', '#00ffff', '#ff00ff'], false);

        // viewerInstance.colorElement('g-2000127', '#ff0000');
        // viewerInstance1.colorElement('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6', '#00ff00');
    }

    document.getElementById('showElements_btn').onclick = function (event) {
        viewerInstance.showElements(['g-2000127', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d'], false);
        viewerInstance1.showElements(['g-2000127', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d'], false);

        // viewerInstance.showElement('g-2000127', false);
        // viewerInstance1.showElement('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d', false);
    }

    document.getElementById('isolateElements_btn').onclick = function (event) {
        viewerInstance.isolateElements(['g-2000127', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d']);
        viewerInstance1.isolateElements(['g-2000127', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d']);

        // viewerInstance.isolateElement('g-2000127');
        // viewerInstance1.isolateElement('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6');
    }

    document.getElementById('opacityElements_btn').onclick = function (event) {
        viewerInstance.setOpacity(['g-2000127', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d'], 0.5);
        viewerInstance1.setOpacity(['g-2000127', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d'], 0.2);

        // viewerInstance.setElementOpacity('g-2000127', 0.2);
        // viewerInstance1.setElementOpacity('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6', 0.5);
    }

    document.getElementById('labelElements_btn').onclick = function (event) {
        viewerInstance.labelElements(['g-2000029', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-000543a4', 'g-2000282'], ['group-1.1', 'group-1.2', 'group-1.3']);
        viewerInstance1.labelElements(['g-2000029', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-000543a4', 'g-2000282'], ['group-2.1', 'group-2.2', 'group-2.3']);

        // viewerInstance.labelElement('g-2000029', 'group-1');
        // viewerInstance1.labelElement('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-000543a4', 'group-2');
    }

    document.getElementById('removeLabels_btn').onclick = function (event) {
        viewerInstance.removeLabels(['g-2000029', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-000543a4', 'g-2000282']);
        viewerInstance1.removeLabels(['g-2000029', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-000543a4', 'g-2000282']);

        // viewerInstance.removeLabel('g-2000029');
        // viewerInstance1.removeLabel('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-000543a4');
    }

    document.getElementById('lockElements_btn').onclick = function (event) {
        viewerInstance.lockElements(['g-2000127', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d'], true);
        viewerInstance1.lockElements(['g-2000127', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d'], true);

        // viewerInstance.lockElement('g-2000127', true);
        // viewerInstance1.lockElement('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6', true);
    }

    document.getElementById('resetElement_btn').onclick = function (event) {
        viewerInstance.resetElement('g-2000127');
        viewerInstance1.resetElement('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6');
    }

    document.getElementById('resetAllColors_btn').onclick = function (event) {
        viewerInstance.resetAllColors();
        viewerInstance1.resetAllColors();
    }

    document.getElementById('showAll_btn').onclick = function (event) {
        viewerInstance.showAll(true);
        viewerInstance1.showAll(true);
    }

    document.getElementById('resetAll_btn').onclick = function (event) {
        viewerInstance.resetAll();
        viewerInstance1.resetAll();
    }

    document.getElementById('clearAll_btn').onclick = function (event) {
        viewerInstance.clearAll();
        viewerInstance1.clearAll();
    }

    document.getElementById('removeDrawing_btn').onclick = function (event) {
        viewerInstance.removeDrawing('g-2000127');
        viewerInstance1.removeDrawing('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00053d5a');
    }

    document.getElementById('zoomElements_btn').onclick = function (event) {
        // viewerInstance.zoomToElements(['g-2000029', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-000547de', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-000547ad']);
        // viewerInstance1.zoomToElements(['g-2000029', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-000547de', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-000547ad']);

        viewerInstance.zoomSelection('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-000543a4');
        viewerInstance1.zoomSelection('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-000543bf');
    }

    document.getElementById('zoomExtent_btn').onclick = function (event) {
        viewerInstance.zoomExtents();
        viewerInstance1.zoomExtents();
    }

    document.getElementById('selectElements_btn').onclick = function (event) {
        // viewerInstance.selectElements(['g-2000127', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d']);
        // viewerInstance1.selectElements(['g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6', 'g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054d2d']);

        viewerInstance.selectElement('g-2000127');
        viewerInstance1.selectElement('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6');
    }

    document.getElementById('highlightedElement_btn').onclick = function (event) {
        viewerInstance.highlightedElement('g-2000127');
        viewerInstance1.highlightedElement('g312e24b6-c5bc-4e1f-9789-ab3278db96e7-00054cb6');
    }

    document.getElementById('translateDrawing_btn').onclick = function () {
        viewerInstance.translateDrawing('Cs_Prototech-3D_Section.svg', 5050, -2050);
        viewerInstance1.translateDrawing('Cs_Prototech-3D_Section.svg', 5050, -2050);
    }

    document.getElementById('rotateDrawing_btn').onclick = function () {
        viewerInstance.rotateDrawing('Cs_Prototech-3D_Section.svg', 90);
        viewerInstance1.rotateDrawing('Cs_Prototech-3D_Section.svg', 90);
    }

    document.getElementById('scaleDrawing_btn').onclick = function () {
        viewerInstance.scaleDrawing('Cs_Prototech-3D_Section.svg', 2);
        viewerInstance1.scaleDrawing('Cs_Prototech-3D_Section.svg', 2);
    }

    // document.getElementById('testAPI_btn').onclick = function () {

    // }
}