import utilsInstance from "./Utils.js";
import plotMgrInstance from "./PlotMgr.js"
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

// viewer default settings
let _defaultParams = {
    backgroundColor: 'white',
    selectionColor: '#0000ff',
    highlightOpacity: 0.5,
    XAxisDomainRange: [-100, 100],
    axisColor: 'black',
    barPlotColor: '#555555'
};

class BarPlot {
    /**
    * Adds a Bar plot with default or custom viewer settings.
    * Plot instance used for below functionalities :
    * 1. Register events, single and multiple selection of elements, highlighting elements, clearing selection and highlights of elements.
    * 2. Apply custom background, selection, axis, barplot colors to bar plot.
    * 3. Apply X axis domain range to bar plot.
    * 4. Apply highlight opacity to bar plot.
    * @param {{ backgroundColor: any,  selectionColor: any,  axisColor: any, highlightOpacity: number, barPlotColor: any,  XAxisDomainRange: number}} initParams Pass the customized settings to apply on 2D plot instace. If customization is not passed then default settings will apply on 2D plot instance
    * @returns {Object} Returns added bar plot.
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
        this.barPlotColor = params.barPlotColor;
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
                group.__data__.ids.forEach(id => {
                    this.arrayElements.push(id)
                });
                this.applySelectionColor(selectedElement);
                callBack([...new Set(this.arrayElements)]);
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
    * Add the bar plot.
    * @param {any} newData The newData parameter take the data for creation of Bar plot.
    * @param {number} idForPlotCreation The idForPlotCreation parameter is the id for each data object.
    * @param {string} keyForPlotCreation The keyForPlotCreation parameter is the key for the creation of Bar plot.
    * @param {string} layoutType The layoutType parameter is used for checking the data types.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    addBarPlot(newData, idForPlotCreation, keyForPlotCreation, layoutType, flipAxis = false, domain = true, idKeyValue = undefined) {
        try {
            let dataArr = [];
            // Create the bar plot layout for number or count layout type
            if (layoutType == 'value') {
                if (keyForPlotCreation == 'string' || keyForPlotCreation == 'bool') {
                    error.textContent = 'Failed to add bar plot for string and boolean using number layout type'
                }

                else {
                    let response = utilsInstance.filterNumberTypeData(newData, idForPlotCreation, keyForPlotCreation, idKeyValue);
                    if (response.status == 'success') {
                        dataArr = response.data;
                    }
                }
            }
            // Create the bar plot layout for string, bool and date datatype
            else {
                let response = utilsInstance.filterOtherTypeData(newData, idForPlotCreation, keyForPlotCreation, idKeyValue);
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

            if (flipAxis == true) {
                // Add X axis
                if (domain == true) {
                    let x = d3.scaleLinear()
                        .domain([d3.max(dataArr, function (d) {
                            return d.value;
                        }), 0])
                        .range([0, width])
                    this.svg.append('g')
                        .call(d3.axisLeft(x))
                        .selectAll('text')
                        .attr('transform', 'translate(-10,0)rotate(-45)')
                        .attr('color', this.axisColor)
                        .style('text-anchor', 'end')
                        .style('pointer-events', 'none') // restricted mouse events
                        .style('user-select', 'none') // stanard
                        .style('-webkit-user-select', 'none') // safari
                        .style('-ms-user-select', 'none') // IE10 and IE11

                    // Y axis
                    let y = d3.scaleBand()
                        .range([0, height])
                        .domain(dataArr.map(function (d) { return d.name; }))
                        .padding(.1);
                    this.svg.append('g')
                        .attr('transform', 'translate(0,' + height + ')')
                        .attr('color', this.axisColor)
                        .call(d3.axisBottom(y))

                    //Bars
                    this.svg.selectAll('myRect')
                        .data(dataArr)
                        .enter()
                        .append('rect')
                        .attr('x', function (d) { return y(d.name); })
                        .attr('y', function (d) { return x(d.value); })
                        .attr('width', y.bandwidth())
                        .attr('height', function (d) { return height - x(d.value); })
                        .attr('fill', this.barPlotColor)
                }
                else {
                    let x = d3.scaleLinear()
                        .domain(d3.extent(this.XAxisDomainRange))
                        .range([width, 0]);
                    this.svg.append('g')
                        .call(d3.axisLeft(x))
                        .selectAll('text')
                        .attr('transform', 'translate(-10,0)rotate(-45)')
                        .attr('color', this.axisColor)
                        .style('text-anchor', 'end')
                        .style('pointer-events', 'none') // restricted mouse events
                        .style('user-select', 'none') // stanard
                        .style('-webkit-user-select', 'none') // safari
                        .style('-ms-user-select', 'none'); // IE10 and IE11

                    // Y axis
                    let y = d3.scaleBand()
                        .range([0, height])
                        .domain(dataArr.map(function (d) { return d.name; }))
                        .padding(.1);
                    this.svg.append('g')
                        .attr('transform', 'translate(0,' + height + ')')
                        .attr('color', this.axisColor)
                        .call(d3.axisBottom(y))

                    //Bars
                    this.svg.selectAll('myRect')
                        .data(dataArr)
                        .enter()
                        .append('rect')
                        .attr('x', function (d) { return y(d.name); })
                        .attr('y', function (d) { return x(Math.max(0, d.value)) })
                        .attr('width', y.bandwidth())
                        .attr('height', function (d) { return Math.abs(x(d.value) - x(0)); })
                        .attr('fill', this.barPlotColor)
                }
            }
            else {
                let x;
                // Add X axis
                if (domain == true) {
                    x = d3.scaleLinear()
                        .domain([0, d3.max(dataArr, function (d) {
                            return d.value;
                        })])
                        .range([0, width])
                    this.svg.append('g')
                        .attr('transform', 'translate(0,' + height + ')')
                        .call(d3.axisBottom(x))
                        .selectAll('text')
                        .attr('transform', 'translate(-10,0)rotate(-45)')
                        .attr('color', this.axisColor)
                        .style('text-anchor', 'end')
                        .style('pointer-events', 'none') // restricted mouse events
                        .style('user-select', 'none') // stanard
                        .style('-webkit-user-select', 'none') // safari
                        .style('-ms-user-select', 'none'); // IE10 and IE11
                }
                else {
                    x = d3.scaleLinear()
                        .domain(d3.extent(this.XAxisDomainRange))
                        .range([0, width]);
                    this.svg.append('g')
                        .attr('transform', 'translate(0,' + height + ')')
                        .attr('color', this.axisColor)
                        .call(d3.axisBottom(x))
                        .selectAll('text')
                        .attr('transform', 'translate(-10,0)rotate(-45)')
                        .style('text-anchor', 'end')
                        .style('pointer-events', 'none') // restricted mouse events
                }

                let y = d3.scaleBand()
                    .domain(dataArr.map(function (d) { return d.name; }))
                    .range([0, height])
                    .padding(.1);
                this.svg.append('g')
                    .attr('color', this.axisColor)
                    .call(d3.axisLeft(y))

                //Bars
                this.svg.selectAll('myRect')
                    .data(dataArr)
                    .enter()
                    .append('rect')
                    .attr('x', function (d) { return x(Math.min(0, d.value)); })
                    .attr('y', function (d) { return y(d.name); })
                    .attr('width', function (d) { return Math.abs(x(d.value) - x(0)); })
                    .attr('height', y.bandwidth())
                    .attr('fill', this.barPlotColor)
            }

            let returnValue = {
                'status': 'success',
                'message': 'Bar plot added'
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                'status': 'failed',
                'message': 'Failed to add bar plot.' + err.message
            }
            return returnValue;
        }
    }

    /**
    * Select the elements of the Bar plot.
    * @param {number} elementIDs The elementIDs parameter takes an ids for selecting the elements from Bar plot.
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
                if (this.svg != undefined || this.svg != null) {
                    let selectedElement = [];
                    let childNodeArray = this.svg._groups[0][0].childNodes;
                    for (let i = 0; i < childNodeArray.length; i++) {
                        let counter = 0;
                        if (childNodeArray[i].localName == 'rect') {
                            let elementID = childNodeArray[i].__data__.ids;
                            for (let j = 0; j < selectElementArray.length; j++) {
                                for (let k = 0; k < elementID.length; k++) {
                                    if (elementID[k] == selectElementArray[j]) { counter++; }
                                }
                            }
                            if (counter == elementID.length) {
                                selectedElement = d3.select(childNodeArray[i]);
                                this.applySelectionColor(selectedElement);
                            }
                            else if (counter > 0 && counter <= selectElementArray.length) {
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
    * Highlight the elements of the bar plot.
    * @param {number} elementIDs The elementIDs parameter takes an ids for highlighting the elements from bar plot.
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
                            let elementID = childNodeArray[i].__data__.ids;

                            for (let j = 0; j < selectElementArray.length; j++) {
                                for (let k = 0; k < elementID.length; k++) {
                                    if (elementID[k] === selectElementArray[j]) { counter++ }
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
   * Clean the instance of the bar plot.
   */
    // cleanup the instance
    destroy() {
        let scope = this;
        scope.canvas.innerHTML = '';
    }
}
export { BarPlot }
