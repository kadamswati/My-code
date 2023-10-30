import utilsInstance from "./Utils.js";
import plotMgrInstance from "./PlotMgr.js"
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

// viewer default settings
let _defaultParams = {
    backgroundColor: 'white',
    selectionColor: '#0000ff',
    highlightOpacity: 0.5,
    parallelCoordinatePlotColor: '#555555'
};

class ParallelCoordinatePlot {
    /**
    * Adds a ParallelCoordinate plot with default or custom viewer settings.
    * Plot instance used for below functionalities :
    * 1. Register events, single and multiple selection of elements, highlighting elements, clearing selection and highlights of elements.
    * 2. Apply custom background, axis, selection, parallelCoordinatePlot colors to ParallelCoordinate plot.
    * 3. Apply X axis domain range to ParallelCoordinate plot.
    * 4. Apply highlight opacity to ParallelCoordinate plot.
    * @param {{ backgroundColor: any,  selectionColor: any,  highlightOpacity: number, parallelCoordinatePlotColor: any}} initParams Pass the customized settings to apply on 2D plot instace. If customization is not passed then default settings will apply on 2D plot instance
    * @returns {Object} Returns added ParallelCoordinate plot.
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
        this.arrayElements = [];
        this.parallelCoordinatePlotColor = params.parallelCoordinatePlotColor;
        this.svg = null;
        this.onScrub = null;
        this.idsUnderBrush = [];
        this.idsOfAllPlots = [];
        this.mainMap = new Map();
        this.numberTypeDataValuesMap = new Map();
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
                    case 'scrub-selection':
                        this.onScrub = callBack;
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
                // group.__data__.uuid.forEach(id => {
                //     this.arrayElements.push(group.__data__.uuid)
                // });
                this.arrayElements.push(group.__data__.uuid)
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
        let scope = this;
        scope.temp_pick.push(element)
        // element.style("fill", "white")
        element.style("stroke", this.selectionColor);
        element.style('stroke-width', 3);
        element.attr('name', 'pickElement');
    }

    // Highlight event
    highlightElement(event, callBack) {
        if (this.highlightElementFlagCheck) {
            let group = event.target;
            let highlightedElement;
            plotMgrInstance.deHighlightElementsInAllPlots();
            //this.clear_highlightSelection();
            if (highlightedElement = d3.select(group)) {
                if (group.__data__ != undefined) {
                    callBack(group.__data__.uuid);
                    let parentElement = group.parentElement.parentElement.childNodes;
                    let parentElements = parentElement[0].childNodes
                    for (let i = 1; i < parentElements.length; i++) {
                        let elementdata = parentElements[i];
                        if (elementdata.localName == 'line') {
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
            for (let i = 0; i < this.temp_pick.length; i++) {
                let element = this.temp_pick[i];

                if (element.attr('name') == "pickElement") {
                    element.attr('name', null);
                    element.style("stroke", "steelblue");
                    element.style("stroke-width", "");
                }
            }
            this.temp_pick = [];
            this.arrayElements = [];
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
                    element.style("stroke", "steelblue");
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
    * Add the ParallelCoordinate plot.
    * @param {any} newData The newData parameter take the data for creation of ParallelCoordinate plot.
    * @param {number} idForParallelCoordinatePlotCreation The idForPlotCreation parameter is the id for each data object.
    * @param {string} layoutType The layoutType parameter is used for checking the data types.
    * @param {boolean} flipAxis The flipAxis parameter is used to flip the axis of ParallelCoordinate plot.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    addParallelCoordinatePlot(newData, listOfColumns, idForParallelCoordinatePlotCreation, layoutType, flipAxis = false, idKeyValue = undefined) {
        try {
            let dataArr = [];
            let scope = this;
            const mySet = new Set();

            // Create the ParallelCoordinate plot layout for number or count layout type
            if (layoutType == 'value') {
                let response = utilsInstance.filterParallelCoordinateData(newData, idForParallelCoordinatePlotCreation, idKeyValue);
                if (response.status == 'success') {
                    dataArr = response.data;
                }
            }

            // Create the ParallelCoordinate plot layout for string, bool and date datatype
            else {
                let response = utilsInstance.filterOtherTypeParallelCoordinateData(newData, idForParallelCoordinatePlotCreation, idKeyValue);
                if (response.status == 'success') {
                    dataArr = response.data;
                }
            }

            for (let i = 0; i < listOfColumns.length; i++) {
                for (let j = 0; j < dataArr.length; j++) {
                    let key = dataArr[j][listOfColumns[i]];
                    let id = dataArr[j][idForParallelCoordinatePlotCreation];

                    if (key != undefined && key != "") {
                        if (scope.mainMap.has(listOfColumns[i])) {
                            let isFound = false;
                            for (let k = 0; k < scope.mainMap.get(listOfColumns[i]).length; k++) {
                                if (scope.mainMap.get(listOfColumns[i])[k].has(key)) {
                                    scope.mainMap.get(listOfColumns[i])[k].get(key).push(id);
                                    isFound = true;
                                    break;
                                }
                            }
                            if (!isFound) {
                                let dataMap = new Map([[key, [id]]]);
                                scope.mainMap.get(listOfColumns[i]).push(dataMap);
                            }
                        }
                        else {
                            let dataMap = new Map([[key, [id]]]);
                            scope.mainMap.set(listOfColumns[i], [dataMap]);
                        }
                    }
                }
            }

            // set the dimensions and margins of the graph
            let margin = { top: 20, right: 30, bottom: 40, left: 90 },
                width = this.canvas.clientWidth - margin.left - margin.right,
                height = this.canvas.clientHeight - margin.top - margin.bottom;

            let dimensions = "0 0 " + this.canvas.offsetWidth + " " + this.canvas.offsetHeight;

            if (flipAxis == true) {
                // append the svg object to the body of the page
                this.svg = d3.select(this.canvas)
                    .append("svg")
                    .attr("viewBox", dimensions)
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")" + "rotate(170, " + width / 2 + "," + height / 2 + ")");
            }
            else {
                // append the svg object to the body of the page
                this.svg = d3.select(this.canvas)
                    .append("svg")
                    .attr("viewBox", dimensions)
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .append("g")
                    .attr("transform",
                        `translate(${margin.left},${margin.top})`);
            }

            let x = d3.scaleBand().rangeRound([0, width]).padding(1),
                y = {},
                dragging = {};

            let line = d3.line(),
                background,
                foreground,
                extents;

            let svg = d3.select(this.canvas).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            let quant_p = function (v) { return (parseFloat(v) == v) || (v == "") };

            if (layoutType == 'value') {
                x.domain(dimensions = Object.keys(dataArr[0]).filter(function (d) {
                    scope.idsOfAllPlots = dataArr[0].uuid;
                    if (listOfColumns.includes(d)) {
                        return d;
                    }
                }))
            }
            else {
                x.domain(dimensions = Object.keys(dataArr[0]).filter(function (d) {
                    scope.idsOfAllPlots = dataArr[0].uuid;
                    if (listOfColumns.includes(d)) {
                        return d;
                    }
                }))
            }

            dimensions.forEach(function (d) {
                let vals = dataArr.map(function (p) { return p[d]; });
                if (vals.every(quant_p)) {
                    y[d] = d3.scaleLinear()
                        .domain(d3.extent(dataArr, function (p) {
                            return +p[d];
                        }))
                        .range([height, 0])

                    let fliteredVals = [];
                    for (let i = 0; i < vals.length; ++i) {
                        if (vals[i] != "") {
                            fliteredVals.push(vals[i]);
                        }
                    }
                    scope.numberTypeDataValuesMap.set(d, fliteredVals);
                }
                else {
                    let vals = dataArr.map(function (p) { return p[d]; });
                    y[d] = d3.scalePoint()
                        .domain(vals.filter(function (v, i) { return vals.indexOf(v) == i; }))
                        .range([height, 0], 1);
                }
            })

            extents = dimensions.map(function (p) { return [0, 0]; });

            // Add grey background lines for context.
            background = this.svg.append("g")
                .attr("class", "background")
                .selectAll("path")
                .data(dataArr)
                .enter().append("path")
                .attr("d", path);

            // Add blue foreground lines for focus.
            foreground = this.svg.append("g")
                .attr("class", "foreground")
                .selectAll("path")
                .data(dataArr)
                .enter().append("path")
                .attr("d", path);

            // Add a group element for each dimension.
            let g = this.svg.selectAll(".dimension")
                .data(dimensions)
                .enter().append("g")
                .attr("class", "dimension")
                .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
                .call(d3.drag()
                    .subject(function (d) { return { x: x(d) }; })
                    .on("start", function (d) {
                        dragging[d] = x(d);
                        background.attr("visibility", "hidden");
                    })
                    .on("drag", function (d) {
                        dragging[d] = Math.min(width, Math.max(0, event.x));
                        foreground.attr("d", path);
                        dimensions.sort(function (a, b) { return position(a) - position(b); });
                        x.domain(dimensions);
                        g.attr("transform", function (d) { return "translate(" + position(d) + ")"; })
                    })
                    .on("end", function (d) {
                        delete dragging[d];
                        transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                        transition(foreground).attr("d", path);
                        background
                            .attr("d", path)
                            .transition()
                            .delay(500)
                            .duration(0)
                            .attr("visibility", null);
                    }));

            // Add an axis and title.
            g.append("g")
                .attr("class", "axis")
                .each(function (d) { d3.select(this).call(d3.axisLeft(y[d])); })
                //text does not show up because previous line breaks somehow
                .append("text")
                .attr("fill", "black")
                .style("text-anchor", "middle")
                .attr("y", -9)
                .text(function (d) { return d; });

            // Add and store a brush for each axis.
            g.append("g")
                .attr("class", "brush")
                .each(function (d) {
                    d3.select(this).call(y[d].brush = d3.brushY().extent([[-8, 0], [8, height]]).on("start", brushstart).on("brush", brushed));
                })
                .selectAll("rect")
                .attr("x", -8)
                .attr("width", 16);

            function position(d) {
                let v = dragging[d];
                return v == null ? x(d) : v;
            }

            function transition(g) {
                return g.transition().duration(500);
            }

            // Returns the path for a given data point.
            function path(d) {
                return line(dimensions.map(function (p) { return [position(p), y[p](d[p])]; }));
            }

            function brushstart(event) {
                scope.idsUnderBrush = [];
                mySet.clear();
                event.sourceEvent.stopPropagation();
            }

            // Handles a brush event, toggling the display of foreground lines.
            function brushed(event) {
                let selected = [];
                for (let i = 0; i < dimensions.length; ++i) {
                    if (event.target == y[dimensions[i]].brush) {
                        if (y[dimensions[i]].invert) {
                            let yScale = y[dimensions[i]];
                            for (let j = 0; j < scope.numberTypeDataValuesMap.get(dimensions[i]).length; j++) {
                                const s = event.selection;
                                if ((s[0] <= yScale(scope.numberTypeDataValuesMap.get(dimensions[i])[j])) && ((yScale(scope.numberTypeDataValuesMap.get(dimensions[i])[j])) <= s[1])) {
                                    selected.push(scope.numberTypeDataValuesMap.get(dimensions[i])[j])
                                }
                            }
                        }
                        else {
                            let yScale = y[dimensions[i]];
                            selected = yScale.domain().filter(function (d) {
                                let s = event.selection;
                                return (s[0] <= yScale(d)) && (yScale(d) <= s[1])
                            });
                        }

                        if (selected.length > 0) {
                            let selectedIds = [];
                            mySet.clear();
                            scope.idsUnderBrush = [];
                            for (let j = 0; j < selected.length; j++) {
                                for (let k = 0; k < scope.mainMap.get(dimensions[i]).length; k++) {
                                    if (scope.mainMap.get(dimensions[i])[k].has(selected[j])) {
                                        for (let l = 0; l < scope.mainMap.get(dimensions[i])[k].get(selected[j]).length; l++) {
                                            selectedIds.push(scope.mainMap.get(dimensions[i])[k].get(selected[j])[l]);
                                        }
                                    }
                                }

                            }
                            mySet.add(selectedIds);
                            scope.idsUnderBrush = Array.from(mySet);
                            scope.onScrub(scope.idsUnderBrush);
                        }
                    }
                }
            }
            let returnValue = {
                'status': 'success',
                'message': 'ParallelCoordinate plot added'
            }
            return returnValue;
        }
        catch (err) {
            let returnValue = {
                'status': 'failed',
                'message': 'Failed to add ParallelCoordinate plot.' + err.message
            }
            return returnValue;
        }
    }

    /**
    * Select the elements of the ParallelCoordinate plot.
    * @param {number} elementIDs The elementIDs parameter takes an ids for selecting the elements from ParallelCoordinate plot.
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
                        if (childNodeArray[i].className.baseVal == 'foreground') {
                            let childrensArray = childNodeArray[i].children;
                            for (let j = 0; j < childrensArray.length; j++) {
                                for (let k = 0; k < selectElementArray.length; k++) {
                                    if (childrensArray[j].__data__.uuid == selectElementArray[k]) {
                                        selectedElement = d3.select(childrensArray[j]);
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
    * Highlight the elements of the ParallelCoordinate plot.
    * @param {number} elementIDs The elementIDs parameter takes an ids for highlighting the elements from ParallelCoordinate plot.
    * @returns {Object} It returns an object for acknowledgement of this API to the consumer side.
    */
    highlightElements(elementIDs) {
        try {
            if (this.svg != undefined || this.svg != null) {
                let selectedElement = [];
                let childNodeArray = this.svg._groups[0][0].childNodes;
                for (let i = 0; i < childNodeArray.length; i++) {
                    let counter = 0;
                    if (childNodeArray[i].localName == 'path') {
                        let elementID = childNodeArray[i].__data__.uuid;
                        for (let j = 0; j < elementIDs.length; j++) {
                            for (let k = 0; k < elementID.length; k++) {
                                if (elementID[k] != elementIDs[j]) { counter++; }
                            }
                        }
                        if (counter == elementID.length) {
                            selectedElement = d3.select(childNodeArray[i]);
                            this.applyHighlightTransparency(selectedElement);
                        }
                        else if (counter > 0 && counter <= elementIDs.length) {
                            selectedElement = d3.select(childNodeArray[i]);
                            this.applyHighlightTransparency(selectedElement);
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
    * Clean the instance of the ParallelCoordinate plot.
    */
    // cleanup the instance
    destroy() {
        let scope = this;
        scope.canvas.innerHTML = '';
    }
}
export { ParallelCoordinatePlot }
