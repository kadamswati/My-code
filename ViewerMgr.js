import { Viewer } from './Viewer.js'

class ViewerMgr {
    #viewArray = [];
    #activeViewerInstance;

    /**
     * Creates a Viewer Manager Instance. ViewerMgr class is a singleton class so it has only a single instance which is exported and can be used to call the APIs. 
     * Viewer Manager instance used for below functionalities :
     * 1. Add 3D Viewer
     * 2. Get all the existing 3D Viewers and get single 3D Viewer with passed name
     * 3. Get the existing 3D Viewer count
     * 4. Clear all the existing 3D Viewers and clear a single 3D Viewer with passed name
     * Please use the exported 'viewerMgrInstance' instance.
     * @constructor 
     */
    constructor() {
        this.#viewArray = [];
        this.#activeViewerInstance = undefined;
    }

    getActiveViewerInstance() {
        return this.#activeViewerInstance;
    }

    setActiveViewerInstance(instance) {
        this.#activeViewerInstance = instance;
    }

    /**
     * Adds a 3D Viewer.
     * @param {HTMLDivElement} canvas Pass the HTML Div Element which will act as a 3D Viewer. Passed HTML Div Element width and height must be 100%. 
     * @param {string} name Pass the unique name for adding a 3D Viewer. This name is used later to get the 3D viewer and clear the 3D viewer.
     * @param {{ backgroundColor: any,  pickColor: any,  hightlightColor: any,  ghostColor: any,  elevation: number,  azimuth: number,  sceneScale: number}} customParam Pass the customized settings to apply on 3D viewer. If customization is not passed then default settings will apply on 3D Viewer.
     * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
     */
    addViewer(canvas, name, customParam = undefined) {
        try {
            var isfound = false;
            for (let i = 0; i < this.#viewArray.length; i++) {
                if (this.#viewArray[i].name == name) {
                    isfound = true;
                    break;
                }
            }
            if (isfound == false) {
                var viewerInstance;
                if (customParam != undefined) {
                    viewerInstance = new Viewer(customParam);
                }
                else {
                    viewerInstance = new Viewer();
                }
                viewerInstance.addViewer(canvas, name);
                this.resizeOberserverInit(canvas, viewerInstance)
                this.#viewArray.push(viewerInstance);
                ttcore.animate();
                var returnValue = {
                    'status': 'success',
                    'message': 'Viewer added successfully.'
                }
                return returnValue;
            }
            else {
                var returnValue = {
                    'status': 'failed',
                    'message': 'ERROR : Viewer with given name already exists, please use different viewer name.'
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
    * Returns an array of all existing 3D Viewers. As the API returns the array of objects so it should be handled properly at the consumer side.
    * @returns {Array<Object>} Returns array of all existing 3D Viewers. If there are no existing 3D Viewers then it will return an error message.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getAllViewers() {
        try {
            if (this.#viewArray.length >= 1) {
                return this.#viewArray;
            }
            else {
                var returnValue = {
                    'status': 'failed',
                    'message': 'ERROR : No viewer found.'
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
     * Returns 3D Viewers assigned with the passed name. As the API returns an object so it should be handled properly at the consumer side.
     * @param {string} name Pass the name parameter which is assigned to the 3D Viewer at the time of adding the 3D Viewer. This parameter is case sensitive.
     * @returns {Object} Return 3D viewer which is assigned with a passed name. If the name parameter does not match with the existing 3D Viewers name then it will return an error message.
     * @returns {Object} It returns an object for acknowledge of this API to consumer side.
     */
    getViewerByName(name) {
        try {
            if (this.#viewArray.length >= 1) {
                for (let i = 0; i < this.#viewArray.length; i++) {
                    if (this.#viewArray[i].name == name) {
                        return this.#viewArray[i];
                    }
                }
                var returnValue = {
                    'status': 'success',
                    'message': 'Viewer returned successfully.'
                }
                return returnValue;
            }
            else {
                var returnValue = {
                    'status': 'failed',
                    'message': 'ERROR : No viewer found.'
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
     * Give the total count of existing 3D Viewers to the consumer side which needs to be handled.
     * @returns {number} Returns a total count of existing 3D Viewers
     */
    getViewersCount() {
        return this.#viewArray.length;
    }

    /**
     * Clear all the content from all existing 3D Viewers including models, labels, ground and hemisphere light.
     * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
     */
    clearAllViewers() {
        try {
            if (this.#viewArray.length >= 1) {
                this.#viewArray.forEach(function (viewer) {
                    viewer.clearAll();
                })
                var returnValue = {
                    'status': 'success',
                    'message': 'All viewers are removed.'
                }
                return returnValue;
            }
            else {
                var returnValue = {
                    'status': 'failed',
                    'message': 'ERROR : No viewer found.'
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
     * Clear 3D Viewer assigned name.
     * @param {string} name The name parameter takes an existing 3D Viewer name
     * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearViewerByName(name) {
        try {
            if (this.#viewArray.length >= 1) {
                let didWork = false;
                for (let i = 0; i < this.#viewArray.length + 1; i++) {
                    if (this.#viewArray[i]['name'] == name) {
                        this.#viewArray[i].clearAll();
                        didWork = true;
                        break;
                    }
                }
                if (didWork) {
                    var returnValue = {
                        'status': 'success',
                        'message': 'Viewer is removed.'
                    }
                    return returnValue;
                } else {
                    var returnValue = {
                        'status': 'failed',
                        'message': 'ERROR : No viewer with name ' + name + ' found.'
                    }
                    return returnValue;
                };
            }
            else {
                var returnValue = {
                    'status': 'failed',
                    'message': 'ERROR : No viewer found.'
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

    resizeOberserverInit(canvas, viewerInstance) {
        function onResize() {
            if (viewerInstance.canvas != undefined) {
                viewerInstance.camera.aspect = viewerInstance.canvas.offsetWidth / viewerInstance.canvas.offsetHeight;
                viewerInstance.camera.updateProjectionMatrix();
                viewerInstance.renderer.setSize(viewerInstance.canvas.offsetWidth, viewerInstance.canvas.offsetHeight);
                viewerInstance.renderer.render(viewerInstance.scene, viewerInstance.camera);
            }
        }
        let resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(canvas);
        viewerInstance.ResizeObserver = resizeObserver;
    }

    render() {
        if (this.#activeViewerInstance != undefined) {
            this.#activeViewerInstance.render();
        }
    }
}

const viewerMgrInstance = new ViewerMgr();
Object.freeze(viewerMgrInstance);

var ttcore = {
    animate: function () {
        requestAnimationFrame(ttcore.animate);
        viewerMgrInstance.render();
    }
}


export default viewerMgrInstance;