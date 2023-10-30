import utilsInstance from "./Utils.js";
import plotMgrInstance from "./PlotMgr.js"
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

// viewer default settings
let _defaultParams = {
    backgroundColor: 'white',
    selectionColor: '#0000ff',
    highlightOpacity: 0.5,
    axisColor: 'black',
    dotColor: "#69b3a2"
};

class BubblePlot {
    /**
    * Adds a Bubble plot with default or custom viewer settings.
    * Plot instance used for below functionalities :
    * 1. Register events, single and multiple selection of elements, highlighting elements, clearing selection and highlights of elements.
    * 2. Apply custom background, axis, selection, dot, gridline colors to Bubble plot.
    * 3. Apply highlight opacity to Bubble plot.
    * @param {{ backgroundColor: any,  selectionColor: any,  axisColor: any, highlightOpacity: number, dotColor: any}} initParams Pass the customized settings to apply on 2D plot instace. If customization is not passed then default settings will apply on 2D plot instance
    * @returns {Object} Returns added Bubble plot.
    */
    constructor(initParams) {
        let params = { ..._defaultParams, ...(initParams || {}) };
        this.canvas = null;
        this.name = null;
        this.backgroundColor = params.backgroundColor;
        this.temp_pick = [];
        this.temp_highlight = [];
        this.selectionColor = params.selectionColor;
        this.highlightElementFlagCheck = null;
        this.multipleSelectionFlagCheck = null;
        this.highlightOpacity = params.highlightOpacity;
        this.axisColor = params.axisColor;
        this.svg = null;
        this.onScrub = null;
        this.dotColor = params.dotColor;
        this.idsUnderBrush = [];
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
                    case 'element-highlight':
                        d3.select(this.canvas).on('mousemove', (e) => this.highlightElement(e, callBack), false);
                        break;

                    case 'scrub-selection':
                        this.onScrub = callBack;
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

    // apply selection color
    applySelectionColor(element) {
        this.temp_pick.push(element)
        element.style('stroke', this.selectionColor)
        element.style('stroke-width', 3)
        element.attr('name', 'pickElement');
    }

    // Highlight event
    highlightElement(event, callBack) {
        if (this.highlightElementFlagCheck) {
            let group = event.target;
            let highlightedElement;
            plotMgrInstance.deHighlightElementsInAllPlots();
            if (group.localName == "circle") {
                if (highlightedElement = d3.select(group)) {
                    if (group.__data__ != undefined) {
                        callBack(group.__data__.ids);
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
    }

    // apply highlight color API
    applyHighlightTransparency(element) {
        this.temp_highlight.push(element)
        element.style('opacity', this.highlightOpacity);
    }

    /**
    * Clear the selected element
    */
    // Clear pick selection
    clear_pickSelection() { }

    /**
    * Clear all the selected elements
    */
    // Clear all pick selection
    clearAllPickSelection() {
        plotMgrInstance.clearAllPlotSelection();
        plotMgrInstance.selectElementsInScatterPlots();
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
    * Add the Bubble plot.
    * @param {any} newData The newData parameter take the data for creation of Bubble plot.
    * @param {number} idForBubblePlotCreation The idForBubblePlotCreation parameter is the id for each data object.
    * @param {string} valueForBubblePlotCreation The valueForBubblePlotCreation parameter is the value for the creation of Bubble plot.
    * @param {string} keyForBubblePlotCreation The keyForBubblePlotCreation parameter is the key for the creation of Bubble plot.
    * @param {number} radiusForBubblePlotCreation The radiusForBubblePlotCreation parameter is the radius for the creation of Bubble plot.
    * @param {string} layoutType The layoutType parameter is used for checking the data types.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    addBubblePlot(newData, idForBubblePlotCreation, valueForBubblePlotCreation, keyForBubblePlotCreation, radiusForBubblePlotCreation, layoutType, idKeyValue = undefined) {
        try {
            let dataArr = [];
            let scope = this;
            const mySet = new Set();

            // Create the Bubble plot layout for number or count layout type
            if (layoutType == 'value') {
                if (valueForBubblePlotCreation == 'string' || valueForBubblePlotCreation == 'bool') {
                    error.textContent = 'Failed to add bar plot for string and boolean using number layout type'
                }

                else {
                    let response = utilsInstance.filterBubblePlotData(newData, idForBubblePlotCreation, valueForBubblePlotCreation, keyForBubblePlotCreation, radiusForBubblePlotCreation, idKeyValue);
                    if (response.status == 'success') {
                        dataArr = response.data;
                    }
                }
            }
            // Create the Bubble plot layout for string, bool and date datatype
            else {
                let response = utilsInstance.filterBubbleOtherTypeData(newData, idForBubblePlotCreation, valueForBubblePlotCreation, radiusForBubblePlotCreation, idKeyValue);
                if (response.status == 'success') {
                    dataArr = response.data;
                }
            }

            // set the dimensions and margins of the graph
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
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            if (layoutType == 'value') {
                const x = d3.scaleLinear()
                    .domain([0, d3.max(dataArr, function (d) {
                        return d.value;
                    })])
                    .range([0, width]);
                scope.svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x));

                // Add Y axis
                const y = d3.scaleLinear()
                    .domain([0, d3.max(dataArr, function (d) { return d.key; })])
                    .range([height, 0]);
                scope.svg.append("g")
                    .call(d3.axisLeft(y));

                // Add a scale for bubble size
                const z = d3.scaleLinear()
                    .domain([0, d3.max(dataArr, function (d) { return d.radius; })])
                    .range([1, 40]);

                scope.svg.append("g")
                    .call(d3.brush()                 // Add the brush feature using the d3.brush function
                        .extent([[0, 0], [width, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                        .on("start", clearChart)
                        .on("brush", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function
                    )

                // Function that is triggered when brushing is started
                function clearChart(event) {
                    scope.idsUnderBrush = [];
                    scope.clearAllPickSelection();
                    mySet.clear();
                }

                // Function that is triggered when brushing is performed
                function updateChart(event) {
                    mySet.clear();
                    scope.idsUnderBrush = [];
                    const extent = event.selection;
                    dots.classed(this.selectionColor, (d) => {
                        let brushed = isBrushed(extent, x(d.value), y(d.key))
                        if (brushed) {
                            mySet.add(d.ids);
                            scope.idsUnderBrush = Array.from(mySet);
                        }
                        scope.onScrub(scope.idsUnderBrush);
                        return brushed;
                    })
                }

                // A function that return TRUE or FALSE according if a dot is in the selection or not
                function isBrushed(brush_coords, cx, cy) {
                    let x0 = brush_coords[0][0],
                        x1 = brush_coords[1][0],
                        y0 = brush_coords[0][1],
                        y1 = brush_coords[1][1];
                    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
                }

                // Add dots
                let dots = scope.svg
                    .selectAll("dot")
                    .data(dataArr)
                    .join("circle")
                    .attr("cx", d => x(d.value))
                    .attr("cy", d => y(d.key))
                    .attr("r", d => z(d.radius))
                    .style("fill", this.dotColor)
                    .style("opacity", "0.7")
                    .attr("stroke", "black")
            }
            else {
                const xScale = d3.scaleLinear()
                    .domain([0, d3.max(dataArr, function (d) {
                        return d.value;
                    })])
                    .range([0, width]);
                scope.svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(xScale));

                // Add Y axis
                const yScale = d3.scaleBand()
                    .domain(dataArr.map(d => d.name))
                    .range([height, 0])
                    .padding(1);
                scope.svg.append("g")
                    .call(d3.axisLeft(yScale));

                // Add a scale for bubble size
                const z = d3.scaleLinear()
                    .domain([0, d3.max(dataArr, function (d) { return d.radius; })])
                    .range([1, 40]);

                scope.svg.append("g")
                    .call(d3.brush()                 // Add the brush feature using the d3.brush function
                        .extent([[0, 0], [width, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                        .on("start", clearChart)
                        .on("brush", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function
                    )

                // Function that is triggered when brushing is started
                function clearChart(event) {
                    scope.idsUnderBrush = [];
                    scope.clearAllPickSelection();
                    mySet.clear();
                }

                // Function that is triggered when brushing is performed
                function updateChart(event) {
                    mySet.clear();
                    scope.idsUnderBrush = [];
                    const extent = event.selection;
                    dots.classed(this.selectionColor, (d) => {
                        let brushed = isBrushed(extent, xScale(d.value), yScale(d.name))
                        if (brushed) {
                            mySet.add(d.ids);
                            scope.idsUnderBrush = Array.from(mySet);
                        }
                        scope.onScrub(scope.idsUnderBrush);
                        return brushed;
                    })
                }

                // A function that return TRUE or FALSE according if a dot is in the selection or not
                function isBrushed(brush_coords, cx, cy) {
                    let x0 = brush_coords[0][0],
                        x1 = brush_coords[1][0],
                        y0 = brush_coords[0][1],
                        y1 = brush_coords[1][1];
                    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
                }

                // Add dots
                let dots = scope.svg
                    .selectAll("dot")
                    .data(dataArr)
                    .join("circle")
                    .attr("cx", d => xScale(d.value))
                    .attr("cy", d => yScale(d.name))
                    .attr("r", d => z(d.radius))
                    .style("fill", this.dotColor)
                    .style("opacity", "0.7")
                    .attr("stroke", "black")
            }

            let returnValue = {
                'status': 'success',
                'message': 'Bubble plot added'
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                'status': 'failed',
                'message': 'Failed to add Bubble plot.' + err.message
            }
            return returnValue;
        }
    }

    /**
    * Select the elements of the Bubble plot.
    * @param {number} elementIDs The elementIDs parameter takes an ids for selecting the elements from Bubble plot.
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
                        if (childNodeArray[i].localName == 'circle') {
                            let elementID = childNodeArray[i].__data__.ids;
                            for (let k = 0; k < elementIDs.length; k++) {
                                for (let l = 0; l < elementID.length; l++) {
                                    for (let j = 0; j < selectElementArray.length; j++) {
                                        if (elementID[l] == selectElementArray[j]) {
                                            selectedElement = d3.select(childNodeArray[i]);
                                            this.applySelectionColor(selectedElement);
                                        }
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
    * Highlight the elements of the Bubble plot.
    * @param {number} elementIDs The elementIDs parameter takes an ids for highlighting the elements from Bubble plot.
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
                        if (childNodeArray[i].localName == 'circle') {
                            let counter = 0;
                            let elementID = childNodeArray[i].__data__.ids;
                            for (let k = 0; k < selectElementArray.length; k++) {
                                for (let l = 0; l < elementID.length; l++) {
                                    if (elementID[l] === selectElementArray[k]) { counter++; }
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
    * Clean the instance of the Bubble plot.
    */
    // cleanup the instance
    destroy() {
        let scope = this;
        scope.canvas.innerHTML = '';
    }
}
export { BubblePlot }
