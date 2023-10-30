import utilsInstance from "./Utils.js";
import plotMgrInstance from "./PlotMgr.js"
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

// viewer default settings
let _defaultParams = {
    backgroundColor: 'white',
    selectionColor: '#0000ff',
    highlightOpacity: 0.5,
    axisColor: 'black',
    dotColor: '#555555',
    gridLineColor: "black"
};

class ScatterPlot {
    /**
    * Adds a Scatter plot with default or custom viewer settings.
    * Plot instance used for below functionalities :
    * 1. Register events, single and multiple selection of elements, highlighting elements, clearing selection and highlights of elements.
    * 2. Apply custom background, axis, selection, dot, gridline colors to Scatter plot.
    * 3. Apply highlight opacity to Scatter plot.
    * @param {{ backgroundColor: any,  selectionColor: any,  axisColor: any, highlightOpacity: number, dotColor: any,  gridLineColor: any}} initParams Pass the customized settings to apply on 2D plot instace. If customization is not passed then default settings will apply on 2D plot instance
    * @returns {Object} Returns added Scatter plot.
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
        this.XAxisDomainRange = params.XAxisDomainRange;
        this.arrayElements = [];
        this.axisColor = params.axisColor;
        this.linePlotColor = params.linePlotColor;
        this.svg = null;
        this.dotColor = params.dotColor;
        this.gridLineColor = params.gridLineColor;
        this.onScrub = null;
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
        let scope = this;
        scope.temp_pick.push(element)
        element.style('stroke', scope.selectionColor)
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
                            if (elementdata.localName == 'circle') {
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
    * Add the Scatter plot.
    * @param {any} newData The newData parameter take the data for creation of Scatter plot.
    * @param {number} idForPlotCreation The idForPlotCreation parameter is the id for each data object.
    * @param {string} valueForPlotCreation The valueForPlotCreation parameter is the value for the creation of Scatter plot.
    * @param {string} keyForPlotCreation The keyForPlotCreation parameter is the key for the creation of Scatter plot.
    * @param {string} layoutType The layoutType parameter is used for checking the data types.
    * @param {boolean} gridLines The gridLines parameter is used creating gridLines in Scatter plot.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    addScatterPlot(newData, idForPlotCreation, valueForPlotCreation, keyForPlotCreation, layoutType, gridLines = { x: false, y: false }, idKeyValue = undefined) {
        try {
            let dataArr = [];
            const mySet = new Set();
            let scope = this;

            const numberOfTicks = { x: 15, y: 30 }

            // Create the scatter plot layout for number or count layout type
            if (layoutType == 'value') {
                if (valueForPlotCreation == 'string' || valueForPlotCreation == 'bool') {
                    error.textContent = 'Failed to add bar plot for string and boolean using number layout type'
                }

                else {
                    let response = utilsInstance.filterLineAndScatterData(newData, idForPlotCreation, valueForPlotCreation, keyForPlotCreation, idKeyValue);
                    if (response.status == 'success') {
                        dataArr = response.data;
                    }
                }
            }
            // Create the scatter plot layout for string, bool and date datatype
            else {
                let response = utilsInstance.filterOtherTypeData(newData, idForPlotCreation, valueForPlotCreation, idKeyValue);
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
                .attr('transform',
                    'translate(' + margin.left + ',' + margin.top + ')');

            if (layoutType == "value") {
                // Add X axis
                const x = d3.scaleLinear()
                    .domain([d3.max(dataArr, function (d) {
                        return d.value;
                    }), 0])
                    .range([width, 0]);
                this.svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x));

                // Add Y axis
                const y = d3.scaleLinear()
                    .domain([0, d3.max(dataArr, function (d) { return d.key; })])
                    .range([height, 0]);
                this.svg.append("g")
                    .call(d3.axisLeft(y));

                if (gridLines.x) {
                    this.svg.append("g")
                        .style("opacity", 0.3)
                        .attr("class", "grid")
                        .attr("transform", "translate(0," + height + ")")
                        .call(d3.axisBottom(x).ticks(numberOfTicks.x).tickSize(-height).tickFormat(""))
                        .call(g => g.selectAll(".tick:not(:first-of-type) line")
                            .attr("class", "axis_tick")
                            .attr("stroke", this.gridLineColor));
                }
                if (gridLines.y) {
                    this.svg.append("g")
                        .style("opacity", 0.3)
                        .attr("class", "grid")
                        .call(d3.axisLeft(y).ticks(numberOfTicks.y).tickSize(-width).tickFormat(""))
                        .call(g => g.selectAll(".tick:not(:first-of-type) line")
                            .attr("class", "axis_tick")
                            .attr("stroke", this.gridLineColor));
                }

                //Add brushing
                this.svg
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
                let dots = this.svg
                    .selectAll("dot")
                    .data(dataArr)
                    .join("circle")
                    .attr("cx", function (d) { return x(d.value); })
                    .attr("cy", function (d) { return y(d.key); })
                    .attr("r", 7)
                    .style("fill", this.dotColor)
            }
            else {
                // Add X axis
                let x = d3.scaleLinear()
                    .range([0, width])
                    .domain([0, d3.max(dataArr, function (d) {
                        return d.value;
                    })]);
                this.svg.append("g")
                    .attr("transform", "translate(0, " + height + ")")
                    .call(d3.axisBottom(x));

                // Add Y axis
                let y = d3.scaleBand()
                    .range([height, 0])
                    .padding(1)
                    .domain(dataArr.map(function (d) {
                        return d.name;
                    }));
                this.svg.append("g")
                    .call(d3.axisLeft(y));

                if (gridLines.x) {
                    this.svg.append("g")
                        .style("opacity", 0.3)
                        .attr("class", "grid")
                        .attr("transform", "translate(0," + height + ")")
                        .call(d3.axisBottom(x).ticks(numberOfTicks.x).tickSize(-height).tickFormat(""))
                        .call(g => g.selectAll(".tick:not(:first-of-type) line")
                            .attr("class", "axis_tick")
                            .attr("stroke", this.gridLineColor));
                }
                if (gridLines.y) {
                    this.svg.append("g")
                        .style("opacity", 0.3)
                        .attr("class", "grid")
                        .call(d3.axisLeft(y).ticks(numberOfTicks.y).tickSize(-width).tickFormat(""))
                        .call(g => g.selectAll(".tick:not(:first-of-type) line")
                            .attr("class", "axis_tick")
                            .attr("stroke", this.gridLineColor));
                }

                this.svg
                    .call(d3.brush()                 // Add the brush feature using the d3.brush function
                        .extent([[0, 0], [width, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                        .on("start", clearChart)
                        .on("brush", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function
                    )

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
                        let brushed = isBrushed(extent, x(d.value), y(d.name))
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
                let dots = this.svg
                    .selectAll("dot")
                    .data(dataArr)
                    .enter()
                    .append("circle")
                    .style("fill", this.dotColor)
                    .attr("r", 7)
                    .attr("cx", function (d) {
                        return x(d.value);
                    })
                    .attr("cy", function (d) {
                        return y(d.name);
                    });
            }

            const returnValue = {
                'status': 'success',
                'message': 'Scatter plot added'
            }
            return returnValue;
        }
        catch (err) {
            return {
                'status': 'failed',
                'message': 'Failed to add Scatter plot.' + err.message
            }
        }
    }

    /**
    * Select the elements of the scatter plot.
    * @param {number} elementIDs The elementIDs parameter takes an ids for selecting the elements from Scatter plot.
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
                            for (let k = 0; k < selectElementArray.length; k++) {
                                for (let l = 0; l < elementID.length; l++) {
                                    if (elementID[l] == selectElementArray[k]) {
                                        selectedElement = d3.select(childNodeArray[i]);
                                        this.applySelectionColor(selectedElement);
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
    * Highlight the elements of the scatter plot.
    * @param {number} elementIDs The elementIDs parameter takes an ids for highlighting the elements from Scatter plot.
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
    * Clean the instance of the Scatter plot.
    */
    // cleanup the instance
    destroy() {
        let scope = this;
        scope.canvas.innerHTML = '';
    }
}
export { ScatterPlot }
