import utilsInstance from "./Utils.js";
import plotMgrInstance from "./PlotMgr.js"
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

// viewer default settings
let _defaultParams = {
    backgroundColor: "white",
    labelColor: "white",
    selectionColor: "#0000ff",
    outlineColor: "white",
    highlightOpacity: 0.5,
    colorScheme: null,
    outerRadiusOfPieChart: 100
};

class PiePlot {
    /**
    * Adds a Pie plot with default or custom viewer settings.
    * Plot instance used for below functionalities :
    * 1. Register events, single and multiple selection of elements, highlighting elements, clearing selection and highlights of elements.
    * 2. Apply custom background, label, selection, outline colors to pie plot.
    * 3. Apply outer radius to pie plot.
    * 4. Apply highlight opacity to pie plot.
    * @param {{ backgroundColor: any,  selectionColor: any,  labelColor: any, highlightOpacity: number, outerRadiusOfPieChart: number}} initParams Pass the customized settings to apply on 2D plot instace. If customization is not passed then default settings will apply on 2D plot instance
    * @returns {Object} Returns added pie plot.
    */
    constructor(initParams) {
        let params = { ..._defaultParams, ...(initParams || {}) };
        this.backgroundColor = params.backgroundColor;
        this.labelColor = params.labelColor;
        this.selectionColor = params.selectionColor;
        this.outlineColor = params.outlineColor;
        this.highlightOpacity = params.highlightOpacity;
        this.colorScheme = params.colorScheme;
        this.outerRadiusOfPieChart = params.outerRadiusOfPieChart;
        this.canvas = null;
        this.name = null;
        this.multipleSelectionFlagCheck = null;
        this.highlightElementFlagCheck = null;
        this.temp_pick = [];
        this.temp_highlight = [];
        this.arrayElements = [];
        this.group = null;
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
                group.__data__.data.ids.forEach(id => {
                    this.arrayElements.push(id)
                });
                this.applySelectionColor(selectedElement);
                callBack([...new Set(this.arrayElements)]);
            }
            else {
                callBack("");
                plotMgrInstance.deSelectElementsInAllPlots();
            }
        }
    }

    // apply selection color
    applySelectionColor(element) {
        this.temp_pick.push(element)
        element.style("fill", this.selectionColor)
        element.attr('name', 'pickElement');
    }

    applyPartialSelectionColor(element) {
        let svg = d3.select(this.canvas).append("svg");
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
            .style("stroke", this.selectionColor)
            .style("stroke-width", "5")
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
                    callBack(group.__data__.data.ids);
                    let parentElement = group.parentElement.parentElement.childNodes;
                    for (let i = 1; i < parentElement.length; i++) {
                        let elementdata = parentElement[i];
                        if (elementdata.className['baseVal'] == 'arc') {
                            let element = d3.select(elementdata.childNodes[0])
                            if (element != undefined) {
                                if (group != elementdata.childNodes[0]) {
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
        element.style("opacity", this.highlightOpacity);
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

                    if (element.attr('name') == "pickElement") {
                        element.attr('name', null);
                        element.style("fill", "")
                    }
                    else if (element.attr('name') == "partialElement") {
                        element.attr('name', null);
                        element.style("fill", "")
                    }
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
    // Clear all pick selection
    clearAllPickSelection() {
        try {
            for (let i = 0; i < this.temp_pick.length; i++) {
                let element = this.temp_pick[i];

                if (element.attr('name') == "pickElement") {
                    element.attr('name', null);
                    element.style("fill", "");
                }
                else if (element.attr('name') == "partialElement") {
                    element.attr('name', null);
                    element.style("fill", "")
                }
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

                if (element.attr("name") == "pickElement") {
                    element.style("fill", this.selectionColor);
                    element.style("opacity", "1");
                }
                else if (element.attr("name") == "partialElement") {
                    let svg = d3.select(this.canvas).append("svg");
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
                        .style("stroke", this.selectionColor)
                        .style("stroke-width", "5")
                        .style('stroke-opacity', '0.75');

                    this.temp_pick.push(element)
                    element.style('fill', 'url(#diagonalHatch)');
                    element.style("opacity", "1");
                }
                else {
                    element.style("opacity", "1");
                }
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
    * Add the pieplot.
    * @param {any} newData The newData parameter take the data for creation of Pie plot.
    * @param {number} idForPlotCreation The idForPlotCreation parameter is the id for each data object.
    * @param {string} keyForPlotCreation The keyForPlotCreation parameter is the key for the creation of Pie plot.
    * @param {string} layoutType The layoutType parameter is used for checking the data types.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    addPiePlot(newData, idForPlotCreation, keyForPlotCreation, layoutType, idKeyValue = undefined) {
        try {
            // Determine size of arcs
            let arc = d3.arc()
                .innerRadius(0)
                .outerRadius(this.outerRadiusOfPieChart);

            let dataArr = [];
            // Create the pie plot layout for number or count layout type
            if (layoutType == 'value') {
                if (keyForPlotCreation == 'string' || keyForPlotCreation == 'bool') {
                    error.textContent = "Failed to add pie plot for string using number layout type"
                }
                else {
                    let response = utilsInstance.filterNumberTypeData(newData, idForPlotCreation, keyForPlotCreation, idKeyValue);
                    if (response.status == 'success') {
                        dataArr = response.data;
                    }
                }
            }
            // Create the pie plot layout for string, bool and date datatype
            else {
                let response = utilsInstance.filterOtherTypeData(newData, idForPlotCreation, keyForPlotCreation, idKeyValue);
                if (response.status == 'success') {
                    dataArr = response.data;
                }
            }

            // arc colors
            let arcColor;
            if (this.colorScheme == 'sequential') {
                arcColor = d3.scaleOrdinal(d3.schemeGreys[9]);
            }
            else if (this.colorScheme == 'categorical') {
                arcColor = d3.scaleOrdinal(d3.schemeSet3);
            }
            else if (this.colorScheme == null) {
                arcColor = d3.scaleOrdinal().range(['#555555', '#555555', '#555555', '#555555', '#555555', '#555555', '#555555', '#555555', '#555555', '#555555'])
            }

            let pie = d3.pie()
                .value(function (d) {
                    return d.value;
                })
                .sort(null);

            let dimensions = "0 0 " + canvas.offsetWidth + " " + canvas.offsetHeight;
            let plotContainer = d3.select(this.canvas).append("svg")
                .attr("viewBox", dimensions)
                .attr("preserveAspectRatio", "xMinYMin meet");

            let plotCanvas = plotContainer
                .append("g")
                .attr("transform", "translate(" + this.canvas.clientWidth / 2 + "," + this.canvas.clientHeight / 2 + ")");

            // Define inner circle
            plotCanvas.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("opacity", this.highlightOpacity)

            // Calculate SVG paths and fill in the colours
            this.group = plotCanvas.selectAll(".arc")
                .data(pie(dataArr))
                .enter().append("g")
                .attr("class", "arc")

            // Append the path to each g
            this.group.append("path")
                .attr("d", arc)
                .attr("fill", function (d, i) {
                    return arcColor(i);
                })
                .attr("stroke", this.outlineColor)

            let plotLabels = plotCanvas.selectAll(".labels")
                .data(pie(dataArr))
                .enter().append("g")
                .attr("class", "labels")
                .style("pointer-events", "none") // resrticted mouse events
                .style("user-select", "none") // stanard
                .style("-webkit-user-select", "none") // safari
                .style("-ms-user-select", "none"); // IE10 and IE11

            // Append text labels to each arc
            plotLabels.append("text")
                .attr("transform", function (d) {
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .attr("fill", this.labelColor)
                .text(function (d, i) {
                    if (typeof (d.data.name) == 'number') {
                        let decimalFactor = plotMgrInstance.getDefaultParams();
                        return d.data.name.toFixed(decimalFactor).replace(/\.0+$/, '');
                    }
                    else {
                        return d.data.name;
                    }
                });
            let returnValue = {
                "status": "success",
                "message": "Pie plot added"
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                "status": "failed",
                "message": "Failed to add pie plot." + err.message
            }
            return returnValue;
        }
    }

    /**
    * Select the elements of the pie plot.
    * @param {number} elementIDs The elementIDs parameter takes an ids for selecting the elements from Pie plot.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    selectElements(elementIDs) {
        try {
            if (elementIDs.length != 0) {
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
                if (this.group != undefined || this.group != null) {
                    let selectedElement = [];
                    for (let i = 0; i < this.group._groups[0].length; i++) {
                        let counter = 0;
                        let elementID = this.group._groups[0][i].__data__.data.ids;
                        for (let j = 0; j < selectElementArray.length; j++) {
                            for (let k = 0; k < elementID.length; k++) {
                                if (elementID[k] == selectElementArray[j]) {
                                    counter++;
                                }
                            }
                        }
                        if (counter == elementID.length) {
                            selectedElement = this.group._groups[0][i]
                            if (selectedElement.className['baseVal'] == 'arc') {
                                let element = d3.select(selectedElement.childNodes[0])
                                if (element != undefined) {
                                    if (this.group != selectedElement.childNodes[0]) {
                                        this.applySelectionColor(element);
                                    }
                                }
                            }
                        }
                        else if (counter > 0 && counter <= selectElementArray.length) {
                            selectedElement = this.group._groups[0][i]
                            if (selectedElement.className['baseVal'] == 'arc') {
                                let element = d3.select(selectedElement.childNodes[0])
                                if (element != undefined) {
                                    if (this.group != selectedElement.childNodes[0]) {
                                        this.applyPartialSelectionColor(element);
                                    }
                                }
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
    * Highlight the elements of the pie plot.
    * @param {number} elementIDs The elementIDs parameter takes an ids for highlighting the elements from Pie plot.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    highlightElements(elementIDs) {
        try {
            if (elementIDs != undefined && elementIDs.length > 0) {
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
                let highlightedElement = [];
                if (this.group != undefined) {
                    for (let i = 0; i < this.group._groups[0].length; i++) {
                        let counter = 0;
                        let elementID = this.group._groups[0][i].__data__.data.ids;
                        for (let j = 0; j < selectElementArray.length; j++) {
                            for (let k = 0; k < elementID.length; k++) {
                                if (elementID[k] === selectElementArray[j]) { counter++ }
                            }
                        }

                        if (counter == 0) {
                            highlightedElement = this.group._groups[0][i]
                            if (highlightedElement.className['baseVal'] == 'arc') {
                                let element = d3.select(highlightedElement.childNodes[0])
                                if (element != undefined) {
                                    if (this.group != highlightedElement.childNodes[0]) {
                                        this.applyHighlightTransparency(element);
                                    }
                                }
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
   * Clean the instance of the pie plot.
   */
    // cleanup the instance
    destroy() {
        let scope = this;
        scope.canvas.innerHTML = "";
    }
}
export { PiePlot }