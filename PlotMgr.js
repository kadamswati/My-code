import { DonutPlot } from './DonutPlot.js'
import { BarPlot } from './BarPlot.js'
import { PiePlot } from './PiePlot.js'
import { HistogramPlot } from './HistogramPlot.js'
import { LinePlot } from './LinePlot.js'
import { ParallelCoordinatePlot } from './ParallelCoordinatePlot.js'
import { ScatterPlot } from './ScatterPlot.js'
import { BubblePlot } from './BubblePlot.js'

class PlotMgr {
    #defaultParam = {};
    #plotMap = {};

    /**
    * Creates a Plot Manager Instance. PlotMgr class is a singleton class so it has only a single instance which is exported and can be used to call the APIs. 
    * Plot Manager instance used for below functionalities :
    * 1. Add all the plot instances into the viewer
    * 2. Get all the existing plots with passed name
    * 3. Get the existing plots count
    * 4. Clear all the existing plots and clear a single plot with passed name
    * Please use the exported 'plotMgrInstance' instance.
    * @constructor 
    */
    constructor() {
        this.#defaultParam = {
            decimalFactor: 2
        }

        this.#plotMap["donut"] = [];
        this.#plotMap["pie"] = [];
        this.#plotMap["bar"] = [];
        this.#plotMap["histogram"] = [];
        this.#plotMap["line"] = [];
        this.#plotMap["ParallelCoordinate"] = [];
        this.#plotMap["scatter"] = [];
        this.#plotMap["bubble"] = [];
    }

    setDefaultParams(initParams) {
        let params = { ...this.#defaultParam, ...(initParams || {}) };
        this.#defaultParam.decimalFactor = params.decimalFactor;
    }

    getDefaultParams() {
        return this.#defaultParam.decimalFactor;
    }

    /**
    * Adds a donut plot instance.
    * @param {HTMLDivElement} canvas Pass the HTML Div Element which will act as a donut plot instance. Passed HTML Div Element width and height must be 100%. 
    * @param {string} name Pass the unique name for adding a donut plot instance. This name is used later to get the donut plot instance and clear the donut plot instance.
    * @param {{ decimalFactor : number }} defaultParam Pass the customized settings to apply on donut plot instance. If customization is not passed then default settings will apply on donut plot instance.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // Donut plot
    addDonutPlotInstance(canvas, name, defaultParam = undefined) {
        try {
            let isfound = false;
            for (let i = 0; i < this.#plotMap["donut"].length; i++) {
                if (this.#plotMap["donut"][i].name == name) {
                    isfound = true;
                    break;
                }
            }
            if (isfound == false) {
                let donutInstance;
                if (defaultParam != undefined) {
                    donutInstance = new DonutPlot(defaultParam);
                }
                else {
                    donutInstance = new DonutPlot();
                }
                donutInstance.addViewer(canvas, name);
                this.#plotMap["donut"].push(donutInstance);
                let childrens = canvas.offsetParent.children;
                for (let i = 0; i < childrens.length; i++) {
                    console.log("Donut plot instance added:", childrens[i].children);
                }

                let returnValue = {
                    "status": "success",
                    "message": "Viewer added"
                }
                return returnValue;
            }
            else {
                let returnValue = {
                    "status": "failed",
                    "message": "Viewer with given name already exists. Please use different."
                }
                return returnValue;
            }
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Viewer not added" + err.message
            }
            return returnValue;
        }
    }

    /**
   * Returns an array of all existing donut plot instance. As the API returns the array of objects so it should be handled properly at the consumer side.
   * @returns {Array<Object>} Returns array of all existing donut plot instance.
   * @returns {Object} It returns an object for acknowledge of this API to consumer side.
   */
    getAllDonutPlots() {
        return this.#plotMap["donut"];
    }

    /**
    * Returns donut plot instance assigned with the passed name. As the API returns an object so it should be handled properly at the consumer side.
    * @param {string} name Pass the name parameter which is assigned to the donut plot instance at the time of adding the donut plot instance. This parameter is case sensitive.
    * @returns {Object} Return donut plot instance which is assigned with a passed name.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getDonutPlotByName(name) {
        for (let i = 0; i < this.#plotMap["donut"].length; i++) {
            if (this.#plotMap["donut"][i].name == name) {
                return this.#plotMap["donut"][i];
            }
        }
        return undefined;
    }

    /**
    * Give the total count of existing donut plot instances to the consumer side which needs to be handled.
    * @returns {number} Returns a total count of existing donut plot instances.
    */
    getDonutPlotsCount() {
        return this.#plotMap["donut"].length;
    }

    /**
    * Clear all the content from all existing donut plot instances.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearAllDonutPlots() {
        this.#plotMap["donut"].forEach(function (viewer) {
            viewer.destroy();
        })
        while (this.#plotMap["donut"].length) {
            this.#plotMap["donut"].pop();
        }
    }

    /**
    * Clear donut plot instance assigned name.
    * @param {string} name The name parameter takes an existing donut plot instance name
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearDonutPlotByName(name) {
        for (let i = 0; i < this.#plotMap["donut"].length; i++) {
            if (this.#plotMap["donut"][i].name == name) {
                this.#plotMap["donut"][i].destroy();
                this.#plotMap["donut"].splice(i, 1);
            }
        }
    }

    /**
    * Adds a pie plot instance.
    * @param {HTMLDivElement} canvas Pass the HTML Div Element which will act as a pie plot instance. Passed HTML Div Element width and height must be 100%. 
    * @param {string} name Pass the unique name for adding a pie plot instance. This name is used later to get the pie plot instance and clear the pie plot instance.
    * @param {{ decimalFactor : number }} defaultParam Pass the customized settings to apply on pie plot instance. If customization is not passed then default settings will apply on pie plot instance.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // pie plot
    addPiePlotInstance(canvas, name, defaultParam = undefined) {
        try {
            let isfound = false;
            for (let i = 0; i < this.#plotMap["pie"].length; i++) {
                if (this.#plotMap["pie"][i].name == name) {
                    isfound = true;
                    break;
                }
            }
            if (isfound == false) {
                let pieInstance;
                if (defaultParam != undefined) {
                    pieInstance = new PiePlot(defaultParam);
                }
                else {
                    pieInstance = new PiePlot();
                }
                pieInstance.addViewer(canvas, name);
                this.#plotMap["pie"].push(pieInstance);
                let childrens = canvas.offsetParent.children;
                for (let i = 0; i < childrens.length; i++) {
                    console.log("Pie plot instance added:", childrens[i].children);
                }

                let returnValue = {
                    "status": "success",
                    "message": "Viewer added"
                }
                return returnValue;
            }
            else {
                let returnValue = {
                    "status": "failed",
                    "message": "Viewer with given name already exists. Please use different."
                }
                return returnValue;
            }
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Viewer not added" + err.message
            }
            return returnValue;
        }
    }

    /**
    * Returns an array of all existing pie plot instance. As the API returns the array of objects so it should be handled properly at the consumer side.
    * @returns {Array<Object>} Returns array of all existing pie plot instance.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getAllPiePlots() {
        return this.#plotMap["pie"];
    }

    /**
    * Returns pie plot instance assigned with the passed name. As the API returns an object so it should be handled properly at the consumer side.
    * @param {string} name Pass the name parameter which is assigned to the pie plot instance at the time of adding the pie plot instance. This parameter is case sensitive.
    * @returns {Object} Return pie plot instance which is assigned with a passed name.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getPiePlotByName(name) {
        for (let i = 0; i < this.#plotMap["pie"].length; i++) {
            if (this.#plotMap["pie"][i].name == name) {
                return this.#plotMap["pie"][i];
            }
        }
        return undefined;
    }

    /**
    * Give the total count of existing pie plot instances to the consumer side which needs to be handled.
    * @returns {number} Returns a total count of existing pie plot instances.
    */
    getPiePlotsCount() {
        return this.#plotMap["pie"].length;
    }

    /**
    * Clear all the content from all existing pie plot instances.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearAllPiePlots() {
        this.#plotMap["pie"].forEach(function (viewer) {
            viewer.destroy();
        })
        while (this.#plotMap["pie"].length) {
            this.#plotMap["pie"].pop();
        }
    }

    /**
    * Clear pie plot instance assigned name.
    * @param {string} name The name parameter takes an existing pie plot instance name
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearPiePlotByName(name) {
        for (let i = 0; i < this.#plotMap["pie"].length; i++) {
            if (this.#plotMap["pie"][i].name == name) {
                this.#plotMap["pie"][i].destroy();
                this.#plotMap["pie"].splice(i, 1);
            }
        }
    }

    /**
    * Adds a histogram plot instance.
    * @param {HTMLDivElement} canvas Pass the HTML Div Element which will act as a histogram plot instance. Passed HTML Div Element width and height must be 100%. 
    * @param {string} name Pass the unique name for adding a histogram plot instance. This name is used later to get the histogram plot instance and clear the histogram plot instance.
    * @param {{ decimalFactor : number }} defaultParam Pass the customized settings to apply on histogram plot instance. If customization is not passed then default settings will apply on histogram plot instance.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // histogram plot
    addHistogramPlotInstance(canvas, name, defaultParam = undefined) {
        try {
            let isfound = false;
            for (let i = 0; i < this.#plotMap["histogram"].length; i++) {
                if (this.#plotMap["histogram"][i].name == name) {
                    isfound = true;
                    break;
                }
            }
            if (isfound == false) {
                let histogramInstance;
                if (defaultParam != undefined) {
                    histogramInstance = new HistogramPlot(defaultParam);
                }
                else {
                    histogramInstance = new HistogramPlot();
                }
                histogramInstance.addViewer(canvas, name);
                this.#plotMap["histogram"].push(histogramInstance);
                let childrens = canvas.offsetParent.children;
                for (let i = 0; i < childrens.length; i++) {
                    console.log("Histogram plot instance added:", childrens[i].children);
                }

                let returnValue = {
                    "status": "success",
                    "message": "Viewer added"
                }
                return returnValue;
            }
            else {
                let returnValue = {
                    "status": "failed",
                    "message": "Viewer with given name already exists. Please use different."
                }
                return returnValue;
            }
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Viewer not added" + err.message
            }
            return returnValue;
        }
    }

    /**
    * Returns an array of all existing histogram plot instance. As the API returns the array of objects so it should be handled properly at the consumer side.
    * @returns {Array<Object>} Returns array of all existing histogram plot instance.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getAllHistogramPlots() {
        return this.#plotMap["histogram"];
    }

    /**
    * Returns histogram plot instance assigned with the passed name. As the API returns an object so it should be handled properly at the consumer side.
    * @param {string} name Pass the name parameter which is assigned to the histogram plot instance at the time of adding the histogram plot instance. This parameter is case sensitive.
    * @returns {Object} Return histogram plot instance which is assigned with a passed name.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getHistogramPlotByName(name) {
        for (let i = 0; i < this.#plotMap["histogram"].length; i++) {
            if (this.#plotMap["histogram"][i].name == name) {
                return this.#plotMap["histogram"][i];
            }
        }
        return undefined;
    }

    /**
    * Give the total count of existing histogram plot instances to the consumer side which needs to be handled.
    * @returns {number} Returns a total count of existing histogram plot instances.
    */
    getHistogramPlotsCount() {
        return this.#plotMap["histogram"].length;
    }

    /**
    * Clear all the content from all existing histogram plot instances.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearAllHistogramPlots() {
        this.#plotMap["histogram"].forEach(function (viewer) {
            viewer.destroy();
        })
        while (this.#plotMap["histogram"].length) {
            this.#plotMap["histogram"].pop();
        }
    }

    /**
    * Clear histogram plot instance assigned name.
    * @param {string} name The name parameter takes an existing histogram plot instance name
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearHistogramPlotByName(name) {
        for (let i = 0; i < this.#plotMap["histogram"].length; i++) {
            if (this.#plotMap["histogram"][i].name == name) {
                this.#plotMap["histogram"][i].destroy();
                this.#plotMap["histogram"].splice(i, 1);
            }
        }
    }

    /**
   * Adds a Bar plot instance.
   * @param {HTMLDivElement} canvas Pass the HTML Div Element which will act as a Bar plot instance. Passed HTML Div Element width and height must be 100%. 
   * @param {string} name Pass the unique name for adding a Bar plot instance. This name is used later to get the Bar plot instance and clear the Bar plot instance.
   * @param {{ decimalFactor : number }} defaultParam Pass the customized settings to apply on Bar plot instance. If customization is not passed then default settings will apply on Bar plot instance.
   * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
   */
    // Bar plot
    addBarPlotInstance(canvas, name, defaultParam = undefined) {
        try {
            let isfound = false;
            for (let i = 0; i < this.#plotMap["bar"].length; i++) {
                if (this.#plotMap["bar"][i].name == name) {
                    isfound = true;
                    break;
                }
            }
            if (isfound == false) {
                let barInstance;
                if (defaultParam != undefined) {
                    barInstance = new BarPlot(defaultParam);
                }
                else {
                    barInstance = new BarPlot();
                }
                barInstance.addViewer(canvas, name);
                this.#plotMap["bar"].push(barInstance);
                let childrens = canvas.offsetParent.children;
                for (let i = 0; i < childrens.length; i++) {
                    console.log("Bar plot instance added:", childrens[i].children);
                }
                let returnValue = {
                    "status": "success",
                    "message": "Viewer added"
                }
                return returnValue;
            }
            else {
                let returnValue = {
                    "status": "failed",
                    "message": "Viewer with given name already exists. Please use different."
                }
                return returnValue;
            }
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Viewer not added" + err.message
            }
            return returnValue;
        }
    }

    /**
    * Returns an array of all existing Bar plot instance. As the API returns the array of objects so it should be handled properly at the consumer side.
    * @returns {Array<Object>} Returns array of all existing Bar plot instance.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getAllBarPlots() {
        return this.#plotMap["bar"];
    }

    /**
    * Returns Bar plot instance assigned with the passed name. As the API returns an object so it should be handled properly at the consumer side.
    * @param {string} name Pass the name parameter which is assigned to the Bar plot instance at the time of adding the Bar plot instance. This parameter is case sensitive.
    * @returns {Object} Return Bar plot instance which is assigned with a passed name.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getBarPlotByName(name) {
        for (let i = 0; i < this.#plotMap["bar"].length; i++) {
            if (this.#plotMap["bar"][i].name == name) {
                return this.#plotMap["bar"][i];
            }
        }
        return undefined;
    }

    /**
    * Give the total count of existing Bar plot instances to the consumer side which needs to be handled.
    * @returns {number} Returns a total count of existing Bar plot instances.
    */
    getBarPlotsCount() {
        return this.#plotMap["bar"].length;
    }

    /**
    * Clear all the content from all existing Bar plot instances.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearAllBarPlots() {
        this.#plotMap["bar"].forEach(function (viewer) {
            viewer.destroy();
        })
        while (this.#plotMap["bar"].length) {
            this.#plotMap["bar"].pop();
        }
    }

    /**
    * Clear Bar plot instance assigned name.
    * @param {string} name The name parameter takes an existing Bar plot instance name
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearBarPlotByName(name) {
        for (let i = 0; i < this.#plotMap["bar"].length; i++) {
            if (this.#plotMap["bar"][i].name == name) {
                this.#plotMap["bar"][i].destroy();
                this.#plotMap["bar"].splice(i, 1);
            }
        }
    }

    /**
    * Adds a Line plot instance.
    * @param {HTMLDivElement} canvas Pass the HTML Div Element which will act as a Line plot instance. Passed HTML Div Element width and height must be 100%. 
    * @param {string} name Pass the unique name for adding a Line plot instance. This name is used later to get the Line plot instance and clear the Line plot instance.
    * @param {{ decimalFactor : number }} defaultParam Pass the customized settings to apply on Line plot instance. If customization is not passed then default settings will apply on Line plot instance.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // Line plot
    addLinePlotInstance(canvas, name, defaultParam = undefined) {
        try {
            let isfound = false;
            for (let i = 0; i < this.#plotMap["line"].length; i++) {
                if (this.#plotMap["line"][i].name == name) {
                    isfound = true;
                    break;
                }
            }
            if (isfound == false) {
                let lineInstance;
                if (defaultParam != undefined) {
                    lineInstance = new LinePlot(defaultParam);
                }
                else {
                    lineInstance = new LinePlot();
                }
                lineInstance.addViewer(canvas, name);
                this.#plotMap["line"].push(lineInstance);
                let childrens = canvas.offsetParent.children;
                for (let i = 0; i < childrens.length; i++) {
                    console.log("Line plot instance added:", childrens[i].children);
                }
                let returnValue = {
                    "status": "success",
                    "message": "Viewer added"
                }
                return returnValue;
            }
            else {
                let returnValue = {
                    "status": "failed",
                    "message": "Viewer with given name already exists. Please use different."
                }
                return returnValue;
            }
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Viewer not added" + err.message
            }
            return returnValue;
        }
    }

    /**
    * Returns an array of all existing Line plot instance. As the API returns the array of objects so it should be handled properly at the consumer side.
    * @returns {Array<Object>} Returns array of all existing Line plot instance.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getAllLinePlots() {
        return this.#plotMap["line"];
    }

    /**
    * Returns Line plot instance assigned with the passed name. As the API returns an object so it should be handled properly at the consumer side.
    * @param {string} name Pass the name parameter which is assigned to the Line plot instance at the time of adding the Line plot instance. This parameter is case sensitive.
    * @returns {Object} Return Line plot instance which is assigned with a passed name.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getLinePlotByName(name) {
        for (let i = 0; i < this.#plotMap["line"].length; i++) {
            if (this.#plotMap["line"][i].name == name) {
                return this.#plotMap["line"][i];
            }
        }
        return undefined;
    }

    /**
    * Give the total count of existing Line plot instances to the consumer side which needs to be handled.
    * @returns {number} Returns a total count of existing Line plot instances.
    */
    getLinePlotsCount() {
        return this.#plotMap["line"].length;
    }

    /**
    * Clear all the content from all existing Line plot instances.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearAllLinePlots() {
        this.#plotMap["line"].forEach(function (viewer) {
            viewer.destroy();
        })
        while (this.#plotMap["line"].length) {
            this.#plotMap["line"].pop();
        }
    }

    /**
    * Clear Line plot instance assigned name.
    * @param {string} name The name parameter takes an existing Line plot instance name
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearLinePlotByName(name) {
        for (let i = 0; i < this.#plotMap["line"].length; i++) {
            if (this.#plotMap["line"][i].name == name) {
                this.#plotMap["line"][i].destroy();
                this.#plotMap["line"].splice(i, 1);
            }
        }
    }

    /**
    * Adds a ParallelCoordinate plot instance.
    * @param {HTMLDivElement} canvas Pass the HTML Div Element which will act as a ParallelCoordinate plot instance. Passed HTML Div Element width and height must be 100%. 
    * @param {string} name Pass the unique name for adding a ParallelCoordinate plot instance. This name is used later to get the ParallelCoordinate plot instance and clear the ParallelCoordinate plot instance.
    * @param {{ decimalFactor : number }} defaultParam Pass the customized settings to apply on ParallelCoordinate plot instance. If customization is not passed then default settings will apply on ParallelCoordinate plot instance.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // ParallelCoordinate plot
    addParallelCoordinatePlotInstance(canvas, name, defaultParam = undefined) {
        try {
            let isfound = false;
            for (let i = 0; i < this.#plotMap["ParallelCoordinate"].length; i++) {
                if (this.#plotMap["ParallelCoordinate"][i].name == name) {
                    isfound = true;
                    break;
                }
            }
            if (isfound == false) {
                let parallelCoordinateInstance;
                if (defaultParam != undefined) {
                    parallelCoordinateInstance = new ParallelCoordinatePlot(defaultParam);
                }
                else {
                    parallelCoordinateInstance = new ParallelCoordinatePlot();
                }
                parallelCoordinateInstance.addViewer(canvas, name);
                this.#plotMap["ParallelCoordinate"].push(parallelCoordinateInstance);
                let childrens = canvas.offsetParent.children;
                for (let i = 0; i < childrens.length; i++) {
                    console.log("ParallelCoordinate plot instance added:", childrens[i].children);
                }
                let returnValue = {
                    "status": "success",
                    "message": "Viewer added"
                }
                return returnValue;
            }
            else {
                let returnValue = {
                    "status": "failed",
                    "message": "Viewer with given name already exists. Please use different."
                }
                return returnValue;
            }
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Viewer not added" + err.message
            }
            return returnValue;
        }
    }

    /**
    * Returns an array of all existing ParallelCoordinate plot instance. As the API returns the array of objects so it should be handled properly at the consumer side.
    * @returns {Array<Object>} Returns array of all existing ParallelCoordinate plot instance.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getAllParallelCoordinatePlots() {
        return this.#plotMap["ParallelCoordinate"];
    }

    /**
    * Returns ParallelCoordinate plot instance assigned with the passed name. As the API returns an object so it should be handled properly at the consumer side.
    * @param {string} name Pass the name parameter which is assigned to the ParallelCoordinate plot instance at the time of adding the ParallelCoordinate plot instance. This parameter is case sensitive.
    * @returns {Object} Return ParallelCoordinate plot instance which is assigned with a passed name.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getParallelCoordinatePlotByName(name) {
        for (let i = 0; i < this.#plotMap["ParallelCoordinate"].length; i++) {
            if (this.#plotMap["ParallelCoordinate"][i].name == name) {
                return this.#plotMap["ParallelCoordinate"][i];
            }
        }
        return undefined;
    }

    /**
    * Give the total count of existing ParallelCoordinate plot instances to the consumer side which needs to be handled.
    * @returns {number} Returns a total count of existing ParallelCoordinate plot instances.
    */
    getParallelCoordinatePlotsCount() {
        return this.#plotMap["ParallelCoordinate"].length;
    }

    /**
    * Clear all the content from all existing ParallelCoordinate plot instances.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearAllParallelCoordinatePlots() {
        this.#plotMap["ParallelCoordinate"].forEach(function (viewer) {
            viewer.destroy();
        })
        while (this.#plotMap["ParallelCoordinate"].length) {
            this.#plotMap["ParallelCoordinate"].pop();
        }
    }

    /**
    * Clear ParallelCoordinate plot instance assigned name.
    * @param {string} name The name parameter takes an existing ParallelCoordinate plot instance name
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearParallelCoordinatePlotByName(name) {
        for (let i = 0; i < this.#plotMap["ParallelCoordinate"].length; i++) {
            if (this.#plotMap["ParallelCoordinate"][i].name == name) {
                this.#plotMap["ParallelCoordinate"][i].destroy();
                this.#plotMap["ParallelCoordinate"].splice(i, 1);
            }
        }
    }

    /**
    * Adds a Scatter plot instance.
    * @param {HTMLDivElement} canvas Pass the HTML Div Element which will act as a Scatter plot instance. Passed HTML Div Element width and height must be 100%. 
    * @param {string} name Pass the unique name for adding a Scatter plot instance. This name is used later to get the Scatter plot instance and clear the Scatter plot instance.
    * @param {{ decimalFactor : number }} defaultParam Pass the customized settings to apply on Scatter plot instance. If customization is not passed then default settings will apply on Scatter plot instance.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // Scatter plot
    addScatterPlotInstance(canvas, name, defaultParam = undefined) {
        try {
            let isfound = false;
            for (let i = 0; i < this.#plotMap["scatter"].length; i++) {
                if (this.#plotMap["scatter"][i].name == name) {
                    isfound = true;
                    break;
                }
            }
            if (isfound == false) {
                let scatterInstance;
                if (defaultParam != undefined) {
                    scatterInstance = new ScatterPlot(defaultParam);
                }
                else {
                    scatterInstance = new ScatterPlot();
                }
                scatterInstance.addViewer(canvas, name);
                this.#plotMap["scatter"].push(scatterInstance);
                let childrens = canvas.offsetParent.children;
                for (let i = 0; i < childrens.length; i++) {
                    console.log("Scatter plot instance added:", childrens[i].children);
                }
                let returnValue = {
                    "status": "success",
                    "message": "Viewer added"
                }
                return returnValue;
            }
            else {
                let returnValue = {
                    "status": "failed",
                    "message": "Viewer with given name already exists. Please use different."
                }
                return returnValue;
            }
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Viewer not added" + err.message
            }
            return returnValue;
        }
    }

    /**
    * Returns an array of all existing Scatter plot instance. As the API returns the array of objects so it should be handled properly at the consumer side.
    * @returns {Array<Object>} Returns array of all existing Scatter plot instance.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getAllScatterPlots() {
        return this.#plotMap["scatter"];
    }

    /**
    * Returns Scatter plot instance assigned with the passed name. As the API returns an object so it should be handled properly at the consumer side.
    * @param {string} name Pass the name parameter which is assigned to the Scatter plot instance at the time of adding the Scatter plot instance. This parameter is case sensitive.
    * @returns {Object} Return Scatter plot instance which is assigned with a passed name.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getScatterPlotByName(name) {
        for (let i = 0; i < this.#plotMap["scatter"].length; i++) {
            if (this.#plotMap["scatter"][i].name == name) {
                return this.#plotMap["scatter"][i];
            }
        }
        return undefined;
    }

    /**
    * Give the total count of existing Scatter plot instances to the consumer side which needs to be handled.
    * @returns {number} Returns a total count of existing Scatter plot instances.
    */
    getScatterPlotsCount() {
        return this.#plotMap["scatter"].length;
    }

    /**
    * Clear all the content from all existing Scatter plot instances.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearAllScatterPlots() {
        this.#plotMap["scatter"].forEach(function (viewer) {
            viewer.destroy();
        })
        while (this.#plotMap["scatter"].length) {
            this.#plotMap["scatter"].pop();
        }
    }

    /**
    * Clear Scatter plot instance assigned name.
    * @param {string} name The name parameter takes an existing Scatter plot instance name
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearScatterPlotByName(name) {
        for (let i = 0; i < this.#plotMap["scatter"].length; i++) {
            if (this.#plotMap["scatter"][i].name == name) {
                this.#plotMap["scatter"][i].destroy();
                this.#plotMap["scatter"].splice(i, 1);
            }
        }
    }

    /**
    * Adds a Bubble plot instance.
    * @param {HTMLDivElement} canvas Pass the HTML Div Element which will act as a Bubble plot instance. Passed HTML Div Element width and height must be 100%. 
    * @param {string} name Pass the unique name for adding a Bubble plot instance. This name is used later to get the Bubble plot instance and clear the Bubble plot instance.
    * @param {{ decimalFactor : number }} defaultParam Pass the customized settings to apply on Bubble plot instance. If customization is not passed then default settings will apply on Bubble plot instance.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // Bubble plot
    addBubblePlotInstance(canvas, name, defaultParam = undefined) {
        try {
            let isfound = false;
            for (let i = 0; i < this.#plotMap["bubble"].length; i++) {
                if (this.#plotMap["bubble"][i].name == name) {
                    isfound = true;
                    break;
                }
            }
            if (isfound == false) {
                let bubbleInstance;
                if (defaultParam != undefined) {
                    bubbleInstance = new BubblePlot(defaultParam);
                }
                else {
                    bubbleInstance = new BubblePlot();
                }
                bubbleInstance.addViewer(canvas, name);
                this.#plotMap["bubble"].push(bubbleInstance);
                let childrens = canvas.offsetParent.children;
                for (let i = 0; i < childrens.length; i++) {
                    console.log("Bubble plot instance added:", childrens[i].children);
                }
                let returnValue = {
                    "status": "success",
                    "message": "Viewer added"
                }
                return returnValue;
            }
            else {
                let returnValue = {
                    "status": "failed",
                    "message": "Viewer with given name already exists. Please use different."
                }
                return returnValue;
            }
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Viewer not added" + err.message
            }
            return returnValue;
        }
    }

    /**
    * Returns an array of all existing Bubble plot instance. As the API returns the array of objects so it should be handled properly at the consumer side.
    * @returns {Array<Object>} Returns array of all existing Bubble plot instance.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getAllBubblePlots() {
        return this.#plotMap["bubble"];
    }

    /**
    * Returns Bubble plot instance assigned with the passed name. As the API returns an object so it should be handled properly at the consumer side.
    * @param {string} name Pass the name parameter which is assigned to the Bubble plot instance at the time of adding the Bubble plot instance. This parameter is case sensitive.
    * @returns {Object} Return Bubble plot instance which is assigned with a passed name.
    * @returns {Object} It returns an object for acknowledge of this API to consumer side.
    */
    getBubblePlotByName(name) {
        for (let i = 0; i < this.#plotMap["bubble"].length; i++) {
            if (this.#plotMap["bubble"][i].name == name) {
                return this.#plotMap["bubble"][i];
            }
        }
        return undefined;
    }

    /**
    * Give the total count of existing Bubble plot instances to the consumer side which needs to be handled.
    * @returns {number} Returns a total count of existing Bubble plot instances.
    */
    getBubblePlotsCount() {
        return this.#plotMap["bubble"].length;
    }

    /**
    * Clear all the content from all existing Bubble plot instances.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearAllBubblePlots() {
        this.#plotMap["bubble"].forEach(function (viewer) {
            viewer.destroy();
        })
        while (this.#plotMap["bubble"].length) {
            this.#plotMap["bubble"].pop();
        }
    }

    /**
    * Clear Bubble plot instance assigned name.
    * @param {string} name The name parameter takes an existing Bubble plot instance name
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearBubblePlotByName(name) {
        for (let i = 0; i < this.#plotMap["bubble"].length; i++) {
            if (this.#plotMap["bubble"][i].name == name) {
                this.#plotMap["bubble"][i].destroy();
                this.#plotMap["bubble"].splice(i, 1);
            }
        }
    }

    /**
    * Select elements from all the plots.
    * @param {number} elementIDs The elementIDs parameter takes an ids for selecting the elements from all the plots.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // select elements from all plots
    selectElementsInAllPlots(elementIDs) {
        let scope = this;
        let isexecuted = false;
        for (let key in this.#plotMap) {
            if (this.#plotMap.hasOwnProperty(key)) {
                this.#plotMap[key].forEach(function (viewer) {
                    if (key == "scatter" || key == "bubble") {
                        // need to execute this condition only one time
                        if (!isexecuted) {
                            scope.clearElementsInScatterPlot();
                            scope.selectElementsInScatterPlots();
                            isexecuted = true;
                        }

                        viewer.selectElements(elementIDs);
                    }
                    else {
                        viewer.clear_pickSelection();
                        viewer.selectElements(elementIDs);
                    }
                })
            }
        }
    }

    /**
    * Select elements from only the Scatter plot.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    selectElementsInScatterPlots() {
        let completeIdsArray = []
        for (let key in this.#plotMap) {
            if (this.#plotMap.hasOwnProperty(key)) {
                this.#plotMap[key].forEach(function (viewer) {
                    if (viewer.idsUnderBrush.length >= 0)
                        completeIdsArray.push(viewer.idsUnderBrush);
                })
            }
        }
        if (completeIdsArray.length > 0) {
            for (let key in this.#plotMap) {
                if (this.#plotMap.hasOwnProperty(key)) {
                    this.#plotMap[key].forEach(function (viewer) {
                        for (let k = 0; k < completeIdsArray.length; k++) {
                            let selectedElementIds = [];
                            for (let m = 0; m < completeIdsArray[k].length; m++) {
                                selectedElementIds.push(completeIdsArray[k][m]);
                            }
                            viewer.selectElements(selectedElementIds);
                        }
                    })
                }
            }
        }
    }

    /**
    * Clears the elements selection from the Scatter plot.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearElementsInScatterPlot() {
        for (let key in this.#plotMap) {
            if (this.#plotMap.hasOwnProperty(key)) {
                this.#plotMap[key].forEach(function (viewer) {
                    if (key == "scatter" || key == "bubble") {
                        for (let i = 0; i < viewer.temp_pick.length; i++) {
                            let element = viewer.temp_pick[i];
                            element.attr('name', null);
                            element.style("stroke", "");
                            element.style("stroke-width", "");
                            element.style("fill", viewer.dotColor);
                        }
                        viewer.temp_pick = [];
                        viewer.arrayElements = [];
                    }
                })
            }
        }
    }

    /**
    * Clears all the elements selection from all the plots.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    clearAllPlotSelection() {
        for (let key in this.#plotMap) {
            if (this.#plotMap.hasOwnProperty(key)) {
                if (this.#plotMap["ParallelCoordinate"]) {
                    this.#plotMap["ParallelCoordinate"].forEach(function (viewer) {
                        for (let i = 0; i < viewer.temp_pick.length; i++) {
                            let element = viewer.temp_pick[i];
                            element.style("fill", "none")
                            element.style("stroke", "steelblue")
                            element.style("stroke-width", "")
                        }
                        viewer.temp_pick = [];
                        viewer.arrayElements = [];
                    })
                }
                if (this.#plotMap["histogram"]) {
                    this.#plotMap["histogram"].forEach(function (viewer) {
                        for (let i = 0; i < viewer.temp_pick.length; i++) {
                            let element = viewer.temp_pick[i];
                            element.style('fill', viewer.histogramBarColor)
                        }
                        viewer.temp_pick = [];
                        viewer.arrayElements = [];
                    })
                }
                this.#plotMap[key].forEach(function (viewer) {
                    for (let i = 0; i < viewer.temp_pick.length; i++) {
                        let element = viewer.temp_pick[i];
                        element.attr('name', null);
                        element.style("stroke", "");
                        element.style("stroke-width", "");
                        element.style("fill", viewer.dotColor);
                    }
                    viewer.temp_pick = [];
                    viewer.arrayElements = [];
                })
            }
        }
    }

    /**
    * Highlight the elements from all the plots.
    * @param {number} elementIDs The elementIDs parameter takes an ids for highlighting the elements from all the plots.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // highlight elements from all plots
    highlightElementsInAllPlots(elementIDs) {
        for (let key in this.#plotMap) {
            if (this.#plotMap.hasOwnProperty(key)) {
                this.#plotMap[key].forEach(function (viewer) {
                    viewer.clear_highlightSelection();
                    viewer.highlightElements(elementIDs);
                })
            }
        }
    }

    /**
    * Deselect all the elements from all the plots.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // de select elements from all plots
    deSelectElementsInAllPlots() {
        for (let key in this.#plotMap) {
            if (this.#plotMap.hasOwnProperty(key)) {
                this.#plotMap[key].forEach(viewer => {
                    viewer.clearAllPickSelection();
                })
            }
        }
    }

    /**
    * Dehighlight all the elements from all the plots.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // de highlight elements from all plots
    deHighlightElementsInAllPlots() {
        for (let key in this.#plotMap) {
            if (this.#plotMap.hasOwnProperty(key)) {
                this.#plotMap[key].forEach(viewer => {
                    viewer.clear_highlightSelection();
                })
            }
        }
    }
}

const plotMgrInstance = new PlotMgr();
Object.freeze(plotMgrInstance);
export default plotMgrInstance;
