import utilsInstance from "./Utils.js";
import plotMgrInstance from "./PlotMgr.js"
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

// viewer default settings
let _defaultParams = {
    backgroundColor: 'white',
    axisColor: 'black',
    histogramBarColor: '#555555',
    selectionColor: '#0000ff',
    highlightOpacity: 0.5,
    XAxisDomainRange: [0, 100],
    BinsValue: 5
};

class HistogramPlot {
    /**
    * Adds a Histogram plot with default or custom viewer settings.
    * Plot instance used for below functionalities :
    * 1. Register events, single and multiple selection of elements, highlighting elements, clearing selection and highlights of elements.
    * 2. Apply custom background, selection, axis, histogramBar colors to Histogram plot.
    * 3. Apply X axis domain range to Histogram plot.
    * 4. Apply highlight opacity to Histogram plot.
    * 5. Set the bins value to create Histogram plot.
    * @param {{ backgroundColor: any,  selectionColor: any,  axisColor: any, highlightOpacity: number, histogramBarColor: any,  XAxisDomainRange: number, BinsValue: number}} initParams Pass the customized settings to apply on 2D plot instace. If customization is not passed then default settings will apply on 2D plot instance
    * @returns {Object} Returns added Histogram plot.
    */
    constructor(initParams) {
        let params = { ..._defaultParams, ...(initParams || {}) };
        this.backgroundColor = params.backgroundColor;
        this.axisColor = params.axisColor;
        this.histogramBarColor = params.histogramBarColor;
        this.selectionColor = params.selectionColor;
        this.highlightOpacity = params.highlightOpacity;
        this.XAxisDomainRange = params.XAxisDomainRange;
        this.BinsValue = params.BinsValue;
        this.canvas = null;
        this.name = null;
        this.highlightElementFlagCheck = null;
        this.multipleSelectionFlagCheck = null;
        this.temp_pick = [];
        this.temp_highlight = [];
        this.arrayElements = [];
        this.svg = null;
    }

    /**
    * Add a Plot manager instance
    * @param {HTMLDivElement} canvas Pass the HTML Div Element which will act as a Viewer. Passed HTML Div Element width and height must be 100%. 
    * @param {string} name Pass the unique name for adding a Viewer. This name is used later to get the viewer and clear the viewer.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    addViewer(canvas, name) {
        try {
            this.canvas = canvas;
            this.name = name;
            d3.select(this.canvas)
                .attr('width', this.canvas.offsetWidth)
                .attr('height', this.canvas.offsetHeight)
                .style('background', this.backgroundColor);

            let returnValue = {
                'status': 'success',
                'message': 'Viewer created successfully.'
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                'status': 'failed',
                'message': err.message
            }
            return returnValue;
        }
    }

    /**
    * Register the events for selecting and highlighting the elements of the added Viewer.
    * Use a predefined event name only to register the events. Event names are case-sensitive. Below are predefined names for events : 
    * 1. element-select - for selecting the elements
    * 2. element-highlight - for highlighting the element
    * @param {string} eventName Pass the predefined name of event to register the respective event. 
    * @param {Function} callBack Handle The callBack is a function at the consumer side as the element ID is getting returned through the callback function.
    * @returns {any} Returns the selected or highlighted element ID at consumer side callback function.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // callback : register event 
    registerEvent(eventName, callBack) {
        try {
            if ((eventName != undefined || eventName != null) && (callBack != undefined || callBack != null)) {
                switch (eventName) {
                    case 'element-select':
                        d3.select(this.canvas).on('click', (e) => this.pickElement(e, callBack), false);
                        break;

                    case 'element-highlight':
                        d3.select(this.canvas).on('mousemove', (e) => this.highlightElement(e, callBack), false);
                        break;
                }
                let returnValue = {
                    'status': 'success',
                    'message': 'Event registered on viewer successfully.'
                }
                return returnValue;
            }
            else {
                let returnValue = {
                    'status': 'failed',
                    'message': 'ERROR : Event name or callback is either undefined or null.'
                }
                return returnValue;
            }
        }
        catch (err) {
            let returnValue = {
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
    // multiple selection check
    multipleSelectionCheck(status) {
        try {
            if (status != undefined || status != null) {
                this.multipleSelectionFlagCheck = status;

                let returnValue = {
                    'status': 'success',
                    'message': 'Multiple selection enabled successfully.'
                }
                return returnValue;
            }
            else {
                let returnValue = {
                    'status': 'failed',
                    'message': 'ERROR : Status value is either undefined or null.'
                }
                return returnValue;
            }
        }
        catch (err) {
            let returnValue = {
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
    // highlight element flag check 
    highlightCheck(status) {
        try {
            if (status != undefined || status != null) {
                this.highlightElementFlagCheck = status;

                let returnValue = {
                    'status': 'success',
                    'message': 'Highlighting enabled successfully.'
                }
                return returnValue;
            }
            else {
                let returnValue = {
                    'status': 'failed',
                    'message': 'ERROR : Status is either undefined or null.'
                }
                return returnValue;
            }
        }
        catch (err) {
            let returnValue = {
                'status': 'failed',
                'message': err.message
            }
            return returnValue;
        }
    }

    // SELECTION event
    pickElement(event, callBack) {
        this.clear_pickSelection();
        let group = event.target;
        let selectedElement;
        if (selectedElement = d3.select(group)) {
            if (group.__data__ != undefined) {
                let callbackElementIds = [];
                group.__data__.forEach(data => {
                    callbackElementIds.push(data.ids); // for single selection 
                    this.arrayElements.push(data.ids); // for multiple selection
                })
                this.applySelectionColor(selectedElement);
                if (!this.multipleSelectionFlagCheck) callBack([...new Set(callbackElementIds)]); // for single selection 
                if (this.multipleSelectionFlagCheck) callBack([...new Set(this.arrayElements)]); // for multiple selection
            }
            else {
                callBack('');
                plotMgrInstance.deSelectElementsInAllPlots();
            }
        }
    }

    // apply selection color
    applySelectionColor(element) {
        this.temp_pick.push(element)
        element.style('fill', this.selectionColor)
        element.attr('name', 'pickElement');
    }

    // apply partial selection
    applyPartialSelectionColor(element) {
        let svg = d3.select(this.canvas).append('svg');
        svg
            .append('defs')
            .append('pattern')
            .attr('id', 'diagonalHatch')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 4)
            .attr('height', 8)
            .attr('patternTransform', 'rotate(-45 2 2)')
            .append('path')
            .attr('d', 'M -1,2 l 6,0')
            .style('stroke', this.selectionColor)
            .style('stroke-width', '5')
            .style('stroke-opacity', '0.75');
        this.temp_pick.push(element)
        element.style('fill', 'url(#diagonalHatch)');
        element.attr('name', 'partialElement');
    }

    // Highlight event
    highlightElement(event, callBack) {
        if (this.highlightElementFlagCheck) {
            let group = event.target;
            let highlightedElement;
            plotMgrInstance.deHighlightElementsInAllPlots();
            if (highlightedElement = d3.select(group)) {
                if (group.__data__ != undefined) {
                    let callbackElementIds = [];
                    group.__data__.forEach(data => {
                        callbackElementIds.push(data.ids);
                    })
                    callBack(callbackElementIds);
                    let parentElement = group.parentElement.parentElement.childNodes;
                    let parentElements = parentElement[0].childNodes
                    for (let i = 1; i < parentElements.length; i++) {
                        let elementdata = parentElements[i];
                        if (elementdata.localName == 'rect') {
                            let element = d3.select(elementdata)
                            if (element != undefined) {
                                if (group != elementdata) {
                                    this.applyHighlightTransparency(element);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // apply highlight color API
    applyHighlightTransparency(element) {
        this.temp_highlight.push(element)
        element.style('opacity', this.highlightOpacity);
    }

    /**
    * Clear the selected element
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // Clear pick selection
    clear_pickSelection() {
        try {
            if (!this.multipleSelectionFlagCheck) {
                for (let i = 0; i < this.temp_pick.length; i++) {
                    let element = this.temp_pick[i];
                    element.style('fill', this.histogramBarColor)
                }
                this.temp_pick = [];
                this.arrayElements = [];
            }
            let returnValue = {
                'status': 'success',
                'message': 'Cleared the selected element.'
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                'status': 'failed',
                'message': err.message
            }
            return returnValue;
        }
    }

    /**
    * Clear all the selected elements
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // clear all pick selection
    clearAllPickSelection() {
        try {
            for (let i = 0; i < this.temp_pick.length; i++) {
                let element = this.temp_pick[i];
                element.style('fill', this.histogramBarColor)
            }
            this.temp_pick = [];
            this.arrayElements = [];

            let returnValue = {
                'status': 'success',
                'message': 'Cleared all the selected element.'
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                'status': 'failed',
                'message': err.message
            }
            return returnValue;
        }
    }

    /**
    * Clear the highlighted element
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    // Clear highlight selection 
    clear_highlightSelection() {
        try {
            for (let i = 0; i < this.temp_highlight.length; i++) {
                let element = this.temp_highlight[i];
                element.style('opacity', '1');
            }
            this.temp_highlight = [];
            let returnValue = {
                'status': 'success',
                'message': 'Cleared the highlighted element.'
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                'status': 'failed',
                'message': err.message
            }
            return returnValue;
        }
    }

    /**
    * Add the HistogramPlot plot.
    * @param {any} newData The newData parameter take the data for creation of Histogram plot.
    * @param {number} idForPlotCreation The idForPlotCreation parameter is the id for each data object.
    * @param {string} keyForPlotCreation The keyForPlotCreation parameter is the key for the creation of Histogram plot.
    * @param {string} layoutType The layoutType parameter is used for checking the data types.
    * @param {boolean} flipAxis The flipAxis parameter is used to flip the axis of Histogram plot.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    addHistogramPlot(newData, idForPlotCreation, keyForPlotCreation, layoutType, flipAxis = false, idKeyValue = undefined) {
        try {
            let histogramDataArray = [];
            if (layoutType == 'value') {
                let response = utilsInstance.filterNumberTypeData(newData, idForPlotCreation, keyForPlotCreation, idKeyValue);
                if (response.status == 'success') {
                    response.data.forEach(data => {
                        let dataValue = data.value.toString();
                        let dataJsonObject = { 'name': dataValue, 'ids': data.ids }
                        histogramDataArray.push(dataJsonObject);
                    })
                }
            }
            else {
                let response = utilsInstance.filterOtherTypeData(newData, idForPlotCreation, keyForPlotCreation, idKeyValue);
                if (response.status == 'success') {
                    response.data.forEach(data => {
                        let dataValue = data.value.toString();
                        let dataJsonObject = { 'name': dataValue, 'ids': data.ids }
                        histogramDataArray.push(dataJsonObject);
                    })
                }
            }

            let margin = { top: 20, right: 30, bottom: 40, left: 90 },
                width = this.canvas.clientWidth - margin.left - margin.right,
                height = this.canvas.clientHeight - margin.top - margin.bottom;

            let dimensions = "0 0 " + canvas.offsetWidth + " " + canvas.offsetHeight;

            // append the svg object to the body of the page
            this.svg = d3.select(this.canvas)
                .append('svg')
                .attr("viewBox", dimensions)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .append('g')
                .attr('transform',
                    'translate(' + margin.left + ',' + margin.top + ')');

            let x = d3.scaleLinear()
                .domain(this.XAxisDomainRange)
                .range([0, width]);
            this.svg.append('g')
                .attr('transform', 'translate(0,' + height + ')')
                .attr('color', this.axisColor)
                .style('pointer-events', 'none')
                .call(d3.axisBottom(x));

            let histogram = d3.histogram()
                .value(function (d) { return d.name; })
                .domain(x.domain())
                .thresholds(x.ticks(this.BinsValue));

            console.log(histogramDataArray)
            let bins = histogram(histogramDataArray);
            console.log(bins);

            let y = d3.scaleLinear()
                .range([height, 0]);
            y.domain([0, d3.max(bins, function (d) { return d.length; })]);
            this.svg.append('g')
                .attr('color', this.axisColor)
                .style('pointer-events', 'none')
                .call(d3.axisLeft(y));

            this.svg.selectAll('rect')
                .data(bins)
                .join('rect')
                .attr('x', 1)
                .attr('transform', function (d) { return 'translate(' + x(d.x0) + ',' + y(d.length) + ')'; })
                .attr('width', function (d) { return x(d.x1) - x(d.x0) })
                .attr('height', function (d) { return height - y(d.length); })
                .style('fill', this.histogramBarColor)

            let returnValue = {
                'status': 'success',
                'message': 'Histogram plot added'
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                'status': 'failed',
                'message': 'Failed to add histogram plot.' + err.message
            }
            return returnValue;
        }
    }

    /**
    * Select the elements of the Histogram plot.
    * @param {number} elementIDs The elementIDs parameter takes an ids for selecting the elements from Histogram plot.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    selectElements(elementIDs) {
        try {
            if (elementIDs.length != 0) {
                if (this.svg != undefined || this.svg != null) {
                    let selectElementArray = [];
                    if (Array.isArray(elementIDs[0])) {
                        for (let j = 0; j < elementIDs.length; j++) {
                            for (let k = 0; k < elementIDs[j].length; k++) {
                                selectElementArray.push(elementIDs[j][k]);
                            }
                        }
                    }
                    else {
                        for (let j = 0; j < elementIDs.length; j++) {
                            selectElementArray.push(elementIDs[j]);
                        }
                    }
                    let selectedElement = [];
                    let childNodeArray = this.svg._groups[0][0].childNodes;
                    for (let i = 0; i < childNodeArray.length; i++) {
                        let counter = 0;
                        if (childNodeArray[i].localName == 'rect') {
                            let elementID = [];
                            let elementIDArray = childNodeArray[i].__data__;
                            for (let j = 0; j < elementIDArray.length; j++) {
                                for (let k = 0; k < elementIDArray[j].ids.length; k++) {
                                    elementID.push(elementIDArray[j].ids[k]);
                                }
                            }
                            let totalNoOfelementID = 0;
                            let totalNoOfelementIDs = 0;
                            for (let j = 0; j < elementID.length; j++) {
                                totalNoOfelementID++;
                                for (let l = 0; l < selectElementArray.length; l++) {
                                    totalNoOfelementIDs++;
                                    if (elementID[j] === selectElementArray[l]) { counter++; }
                                }
                            }
                            if (counter == totalNoOfelementID) {
                                selectedElement = d3.select(childNodeArray[i]);
                                this.applySelectionColor(selectedElement);
                            }
                            else if (counter > 0 && counter <= totalNoOfelementIDs) {
                                selectedElement = d3.select(childNodeArray[i]);
                                this.applyPartialSelectionColor(selectedElement);
                            }
                        }
                    }
                }
            }
            let returnValue = {
                'status': 'success',
                'message': 'Select the elements.'
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                'status': 'failed',
                'message': err.message
            }
            return returnValue;
        }
    }

    /**
    * Highlight the elements of the Histogram plot.
    * @param {number} elementIDs The elementIDs parameter takes an ids for highlighting the elements from Histogram plot.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    highlightElements(elementIDs) {
        try {
            if (elementIDs != undefined && elementIDs.length > 0) {
                if (this.svg != undefined || this.svg != null) {
                    let selectElementArray = [];
                    if (Array.isArray(elementIDs[0])) {
                        for (let j = 0; j < elementIDs.length; j++) {
                            for (let k = 0; k < elementIDs[j].length; k++) {
                                selectElementArray.push(elementIDs[j][k]);
                            }
                        }
                    }
                    else {
                        for (let j = 0; j < elementIDs.length; j++) {
                            selectElementArray.push(elementIDs[j]);
                        }
                    }
                    let selectedElement = [];
                    let childNodeArray = this.svg._groups[0][0].childNodes;
                    for (let i = 0; i < childNodeArray.length; i++) {
                        let counter = 0;
                        if (childNodeArray[i].localName == 'rect') {
                            let elementID = [];
                            let elementIDArray = childNodeArray[i].__data__;
                            for (let j = 0; j < elementIDArray.length; j++) {
                                for (let k = 0; k < elementIDArray[j].ids.length; k++) {
                                    elementID.push(elementIDArray[j].ids[k]);
                                }
                            }
                            for (let j = 0; j < elementID.length; j++) {
                                for (let k = 0; k < selectElementArray.length; k++) {
                                    if (elementID[j] === selectElementArray[k]) { counter++; }
                                }
                            }
                            if (counter == 0) {
                                selectedElement = d3.select(childNodeArray[i]);
                                this.applyHighlightTransparency(selectedElement);
                            }
                        }
                    }
                }
            }
            let returnValue = {
                'status': 'success',
                'message': 'Highlight the elements.'
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                'status': 'failed',
                'message': err.message
            }
            return returnValue;
        }
    }

    /**
    * Clean the instance of the Histogram plot.
    */
    // cleanup the instance
    destroy() {
        let scope = this;
        scope.canvas.innerHTML = '';
    }
}
export { HistogramPlot }
