import * as d3 from "d3";

// viewer default settings
let _defaultParams = {
  backgroundColor: 'FFFFFF',
  highlightColor: '#ff00ff',
  pickColor: '#72aee6',
  strokeWidth: 0,
  strokeOpacity: 1,
  ghostColor: '#888888',
  filterOpacity: 0.5,
  textColor: '#202020',
  textScale: 0.001,
  hoverWidth: 2,
  hoverColor: "transparent",
  labelSize: 12,
  labelColor: '#ffffff',
  digits: 4,
};

class Viewer {
  constructor(initParams) {
    let params = { ..._defaultParams, ...(initParams || {}) };
    this.canvas = null;
    this.multipleSelectionFlagCheck = null;
    this.highlightElementFlagCheck = null;
    this.zoom = null;
    this.backgroundColor = params.backgroundColor;
    this.highlightColor = params.highlightColor;
    this.hoverWidth = params.hoverWidth;
    this.hoverColor = params.hoverColor;
    this.ghostColor = params.ghostColor;
    this.isGhostColor = false;
    this.filterOpacity = params.filterOpacity;
    this.pickColor = params.pickColor;
    this.strokeWidth = params.strokeWidth;
    this.strokeOpacity = params.strokeOpacity;
    this.textColor = params.textColor;
    this.textScale = params.textScale;
    this.temp_pick = [];
    this.temp_highlight = [];
    this.arrayElements = [];
    this.label_Ids = [];
    this.labelVariables = [];
    this.labelSize = params.labelSize;
    this.labelColor = params.labelColor;
    this.digits = params.digits;
    this.id = null;
  }

  // create D3.js based viewer
  addViewer(canvas) {
    let scope = this;
    scope.canvas = canvas;
    d3.select(canvas)
      .attr('width', scope.canvas.offsetWidth)
      .attr('height', scope.canvas.offsetHeight)
      .style('background', "scope.backgroundColor");
  }

  setSvgParameters() {
    let scope = this;

    var allNodes = d3.select(scope.canvas).selectAll('path, polyline, arc, circle, ellipse, line, rect, text');
    allNodes.each(function () { scope.graphicStatus(this, scope); });
    // console.log("DEFS", d3.select(scope.canvas).selectAll('defs').selectAll('*'));
  }

  graphicStatus(element, scope) {
    var isStroke = true;
    if (getComputedStyle(element).stroke == "none") isStroke = false;
    var isFill = true;
    if (getComputedStyle(element).fill == "none") isFill = false;

    var elem = d3.select(element);
    elem.attr('data-isStroke', isStroke);
    elem.attr('data-isFill', isFill);

    if (isFill && !isStroke) {
      elem.attr('data-isDrawing', true);
    }
    else {
      var overlay = d3.select(element).clone(true);

      overlay.attr('data-isDrawing', true);

      elem.attr('vector-effect', 'non-scaling-stroke');
      elem.style('stroke-width', scope.hoverWidth)
      elem.style('stroke', scope.hoverColor);
      elem.style('fill', 'none');

    }


    // element.setAttribute('filter', "url(#blf)");
  }

  updateLineWidth(strokeWidth) {
    let scope = this;
    if (strokeWidth) {
      if (strokeWidth < 0) strokeWidth = 0;
      this.strokeWidth = strokeWidth;

      if (this.strokeWidth > 0) {
        scope.arrayElements.forEach(groupID => {
          d3.select(scope.canvas).selectAll('#' + groupID).selectAll('*').each(function (d, i) {
            if (this.getAttribute("data-isStroke") == "true") this.style.strokeWidth = strokeWidth;
          })
        });
      }
      else {
        scope.arrayElements.forEach(groupID => {
          d3.select(scope.canvas).selectAll('#' + groupID).selectAll('*').each(function (d, i) {
            if (this.style.strokeWidth) this.style.strokeWidth = null;
          })
        });
      }

    }
  }

  // callback : register event
  registerEvent(eventName, callBack) {
    let scope = this;
    switch (eventName) {
      case 'element-select':
        d3.select(scope.canvas).on('click', (e) => scope.pickElement(e, callBack), false);
        break;
      case 'element-highlight':
        d3.select(scope.canvas).on('mousemove', (e) => scope.highlightElement(e, callBack), false);
        break;
    }
  }

  // multiple or single element selection from user data i.e true or false
  multiSelection(status) {
    let scope = this;
    scope.multipleSelectionFlagCheck = status;
  }

  // highlight element flag check
  highlightCheck(status) {
    let scope = this;
    scope.highlightElementFlagCheck = status;
  }

  // SELECTION event
  pickElement(event, callBack) {
    let scope = this;
    if (!scope.multipleSelectionFlagCheck) {
      scope.clear_pickSelection();
    }
    let group = event.target.parentElement;
    if (group.id != scope.canvas.id && event.target.parentElement.tagName == 'g' && event.target.parentElement.id != 'labelGroup') {
      if (d3.select(scope.canvas).selectAll('#' + group.id).attr('status') != 'locked') {
        scope.arrayElements.push(group.id);
        scope.applySelectionColor(group.id);
        callBack([group.id, event.target.nearestViewportElement.id]);
      }
    } else {
      callBack('');
      scope.clear_pickSelection();
    }
  }

  // apply selection color
  applySelectionColor(group_ID) {
    let scope = this;
    let element = d3.select(scope.canvas)
      .selectAll('#' + group_ID)
      .selectAll('*');
    scope.temp_pick.push(element);

    this.applyColor(element, scope.pickColor);

    element.attr('name', 'pickElement');
  }

  // Clear pick selection
  clear_pickSelection() {
    // console.log("In Clear Pick Selection");
    let scope = this;
    for (let i = 0; i < scope.temp_pick.length; i++) {
      for (const groupIndex in scope.temp_pick[i]._groups) {
        if (scope.temp_pick[i]._groups[groupIndex].length > 0) {
          if (scope.temp_pick[i].attr('color') != null) {

            let color = scope.temp_pick[i].attr('color');
            this.applyColor(scope.temp_pick[i], color);

            scope.temp_pick[i].attr('name', 'colorElement');

          } else {

            scope.temp_pick[i].each(function () {
              var status = this.getAttribute("data-isDrawing") == 'true';
              //console.log("In Clear Highlight Color Clear",status);
              if (status) {
                d3.select(this).style('stroke', null);
                d3.select(this).style('stroke-width', null);
                d3.select(this).style('fill', null);
              }
            })

          }
          if (scope.temp_pick[i].attr('name') == 'pickElement') {

            scope.temp_pick[i].attr('name', null);

          }
        }
      }
    }
    scope.temp_pick = [];
    scope.arrayElements = [];
  }

  //multiple model position
  multipleModelPosition(percentage = 0.95) {
    let scope = this;
    let tempObjects = [];
    d3.select('#parentG' + scope.canvas.id).selectAll('#group').each(function () {
      let viewbox = d3.select(this.firstChild).node().getBBox();
      d3.select(this).attr('transform', 'translate(' + viewbox.x + ',' + viewbox.y + ')');
    });
    d3.select('#parentG' + scope.canvas.id).selectAll('g').each(function () {
      let object = d3.select(this).node().getBBox();
      tempObjects.push(object);
    });

    scope.zoomMultiple(tempObjects, percentage);
  }

  // Highlight event
  highlightElement(event, callBack) {
    let scope = this;
    if (scope.highlightElementFlagCheck) {
      scope.clear_highlightSelection();
      var group = event.target.parentElement;
      if (group.id != null) {
        if (group.id != scope.canvas.id
          && event.target.parentElement.tagName == 'g'
          && event.target.parentElement.id != 'labelGroup') {
          if (d3.select(scope.canvas).selectAll('#' + group.id).attr('status') != 'locked') {
            scope.applyHighlightColor(group.id);
            callBack(group.id);
          }
        }
        else {
          callBack(null);
        }
      }
    }
  }

  applyColor(element, color, setStroke = false) {
    let scope = this;

    element.style('stroke', function () {
      if (this.getAttribute("data-isDrawing") == 'true') {
        if (this.getAttribute("data-isStroke") == "false") {
          return null
          //retun "none"
        } else {
          return color
        }
      }
      else {
        return scope.hoverColor;
      }
    });

    if ((this.strokeWidth > 0) && setStroke) {
      let width = this.strokeWidth;
      element.style('stroke-width', function () {
        if (this.getAttribute("data-isDrawing") == 'true') {
          if (this.getAttribute("data-isStroke") == "false") {
            return null
            //retun "none"
          } else {
            return width
          }
        }
        else {
          return scope.hoverWidth;
        }
      });
    }

    element.style("fill", function () {
      if (this.getAttribute("data-isDrawing") == 'true') {
        if (this.getAttribute("data-isFill") == "false") {
          return null
          //retun "none"
        } else {
          return color
        }
      }
      else {
        return "transparent"//element.style("fill");
      }
    });
  }

  // apply highlight color API
  applyHighlightColor(group_ID) {
    let scope = this;

    let element = d3.select(scope.canvas).selectAll('#' + group_ID).selectAll('*');
    scope.temp_highlight.push(element);

    this.applyColor(element, scope.highlightColor);

  }

  // Clear highlight selection
  clear_highlightSelection() {
    //console.log("Clear Highlighting");
    let scope = this;
    for (let i = 0; i < scope.temp_highlight.length; i++) {
      for (const groupIndex in scope.temp_highlight[i]._groups) {
        if (scope.temp_highlight[i]._groups[groupIndex].length > 0) {
            if (scope.temp_highlight[i].attr('name') == 'pickElement') {

              //console.log("In Clear Highlight Apply Color",status);
              this.applyColor(scope.temp_highlight[i], scope.pickColor);

            } else if (scope.temp_highlight[i].attr('name') == 'colorElement') {

              let color = scope.temp_highlight[i].attr('color');
              this.applyColor(scope.temp_highlight[i], color);

            } else {

              scope.temp_highlight[i].each(function () {

                var status = this.getAttribute("data-isDrawing") == 'true';
                //console.log("In Clear Highlight Color Clear",status);
                if (status) {
                  //console.log("Clear Highlighting SET NULL");
                  d3.select(this).style('stroke-width', null);
                  d3.select(this).style('fill', null);
                  d3.select(this).style('stroke', null);
                }
              })

            }
        }
      }
    }
    scope.temp_highlight = [];
  }

  // return the selected element names with the user
  getSelected() {
    let scope = this;
    return scope.arrayElements;
  }

  // change color of single selected element from user data
  colorElement(group_ID, color) {
    let scope = this;
    if (scope.canvas.children.length != 0) {
      try {
        if (d3.select(scope.canvas).selectAll('#' + group_ID).attr('status') != 'locked') {
          let element = d3.select(scope.canvas).selectAll('#' + group_ID).selectAll('*');

          this.applyColor(element, color, true);

          element.attr('name', 'colorElement');
          element.attr('color', color);
          //scope.setFillColor(group_ID, color)
          scope.arrayElements.push(group_ID);
        }
        else {
          //console.log('Error : ['+String(group_ID)+'] Invalid element id');
        }
      } catch (e) {
        //console.log("Error: Coloring Element:", group_ID, model);
      }
    } else { console.log('Error : Element ID not found.'); }
  }

  //Set Fill Colors
  setFillColor(group_ID, color) {
    let scope = this;

    //Reset Element level color (this should only ever be set by the viewer)
    d3.select(scope.canvas)
      .selectAll('#' + group_ID)
      .selectAll('*')
      .style("Fill", null);

    //check for css class level fill existance and 
    //apply new color if present. 
    d3.select(scope.canvas)
      .selectAll('#' + group_ID)
      .selectAll('*')
      .style("Fill", function () {
        if (this.getAttribute("data-isFill") == "true") {
          return null
          //retun "none"
        } else {
          return color
        }
      });
  }

  // change color of multiple selected elements from user data
  colorElements(group_ID, color, hide) {
    let scope = this;
    if (scope.canvas.children && scope.canvas.children.length != 0) {
      if (hide) {
        scope.isolateElements(group_ID);
      } else {
        scope.isGhostColor = true;
        scope.isolateElements(group_ID);
      }
      for (let i = 0; i < group_ID.length; i++) {
        scope.colorElement(group_ID[i], color[i]);
      }
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }

  // show or hide single selected element from user data
  showElement(group_ID, status) {
    let scope = this;
    let groupID = [];
    groupID.push(group_ID);
    scope.showElements(groupID, status);
  }

  // show or hide multiple selected elements from user data
  showElements(group_ID, status) {
    let scope = this;
    if (scope.canvas && scope.canvas.children.length != 0) {
      let invalidIds = [];
      for (let i = 0; i < group_ID.length; i++) {
        try {
          let result;
          if (status == true) {
            result = 'visible';
          } else {
            result = 'hidden';
          }
          let svgElementTypes = ['polyline', 'text', 'path', 'circle', 'rect', 'ellipse']
          svgElementTypes.forEach(elemType => {
            let element = d3.select(scope.canvas).selectAll('#' + group_ID[i]).selectAll(elemType);
            element.style('visibility', result);
          })
        } catch {
          //invalidIds.push(group_ID[i]);
          //console.log('Error : ['+String(model)+'] Invalid element id');
        }
      }
      //if(invalidIds.length>0){
      //  console.log('Error : There are ['+String(invalidIds.length)+'] Invalid element ids:', invalidIds)
      //}  
    } else {
      //console.log('Error : Model is not colorElementloaded in viewer.'); 
    }
  }

  // isolate single element from user data
  isolateElement(group_ID) {
    let scope = this;
    let groupID = [];
    groupID.push(group_ID);
    scope.isolateElements(groupID);
  }

  // isolate multiple elements from user data
  isolateElements(group_ID) {
    let scope = this;
    if (scope.canvas.children.length != 0) {
      d3.select(scope.canvas).selectAll('g').each(function () {
        if (!scope.existsInArrayWhile(group_ID, this.id) && this.id != 'parentG' + scope.canvas.id && this.id != 'group') {
          let element = d3.select(this);
          if (this.getAttribute("data-isDrawing") == 'true') {
            if (scope.isGhostColor) {
              element.selectAll('polyline').style('stroke', scope.ghostColor).attr('name', 'colorElement').attr('color', scope.ghostColor);
            } else {
              element.style('visibility', 'hidden');
            }
          }
        }
      });
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }

  // lock multiple selected elements from user data
  lockElements(group_ID, status) {
    let scope = this;
    if (scope.canvas && scope.canvas.children.length != 0) {
      let invalidIds = [];
      for (let i = 0; i < group_ID.length; i++) {
        //let model = document.querySelector('#' + group_ID[i]);
        //if (model != undefined) {
        try {
          let result;
          if (status == true) {
            result = 'locked';
          } else {
            result = 'unlocked';
          }
          d3.select(scope.canvas).selectAll('#' + group_ID[i]).attr('status', result);
        } catch {
          //invalidIds.push(group_ID[i]);
          //console.log('Error : Invalid element id.'); 
        }
      }
      if (invalidIds.length > 0) {
        //console.log('Error : ['+String(invalidIds.length)+'] Invalid element ids durring lock');
      }
    } else {
      console.log('Error : Model is not loaded in viewer.');
    }
  }

  // lock canvas single element disabling click, hover
  lockElement(group_ID, status) {
    let scope = this;
    let groupID = [];
    groupID.push(group_ID);
    scope.lockElements(groupID, status);
  }

  // set the element opacity from user data
  setElementOpacity(group_ID, opacity) {
    let scope = this;
    let groupID = [];
    groupID.push(group_ID);
    scope.setOpacity(groupID, opacity);
  }

  // set multiple elements opacity from user data
  setOpacity(group_ID, opacity) {
    let scope = this;
    if (scope.canvas.children.length != 0 && group_ID != "") {
      try {
        for (let i = 0; i < group_ID.length; i++) {
          let element = d3.select(scope.canvas).selectAll('#' + group_ID[i]).selectAll('*');
          element.style('opacity', opacity);
          element.attr('name', 'undefined');
        }
      }
      catch {
        //console.log('Error : Invalid element id.'); 
      }
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }

  labelElement(group_ID, value) {
    try {
      let scope = this;
      let groupID = [], values = [];
      groupID.push(group_ID);
      values.push(value);
      scope.labelElements(groupID, values);
      var returnValue = {
        'status': 'success',
        'message': 'Label element API'
      }
      return returnValue;
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }

  labelElements(group_ID, value) {
    
    try {
      let scope = this;
    // console.log("3D Viewer",scope.digits);
      var x, y, object, svgObject;
      if (scope.canvas.children.length != 0) {
        scope.clearAllLabels();
        for (let i = 0; i < group_ID.length; i++) {
          let drawing = document.querySelector('#' + group_ID[i]);
          if (drawing != undefined) {
            scope.label_Ids.push(group_ID[i]);
            scope.labelVariables.push(value[i]);
            const elements = d3.select(scope.canvas).selectAll('#' + group_ID[i]).each(function () {
              if (d3.select(this).selectAll('#labelGroup').size()) {
                d3.select(this).selectAll('#labelGroup').remove();
              }
              d3.select(this).append('g').attr('id', 'labelGroup');
              object = d3.select(this).node().getBBox();
              svgObject = d3.select(this)._groups[0][0].nearestViewportElement.getBBox();
              x = object.x + object.width / 2;
              y = object.y + object.height / 2;
              let fontSize = Math.max(svgObject.width, svgObject.height) * scope.textScale * scope.labelSize;
              scope.labelStyle(this, value[i], x, y, fontSize);
              let border = fontSize / 2.0;
              let textBorder = d3.select(this).select('#labelGroup').select('text').node().getBBox();
              d3.select(this).select('#labelGroup').select('text').remove();
              d3.select(this).select('#labelGroup').append('rect').attr('x', textBorder.x - border)
                .attr('y', textBorder.y - border / 4).attr('width', textBorder.width + border * 2).attr('height', textBorder.height + border / 2).attr('rx', border * 1.5).attr('ry', border * 1.5)
                .style('stroke', 'none').style('fill', scope.labelColor).style('opacity', 0.9);
              scope.labelStyle(this, value[i], x, y, fontSize);
            });
          }
        }
        var returnValue = {
          'status': 'success',
          'message': 'Label elements API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Either drawing is not loaded in viewer or element id array and label array is not same.'
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

  // label style
  labelStyle(element, label, x, y, fontSize) {
    let scope = this;

    let elem = d3.select(element).select('#labelGroup').append('text').text(scope.setDigits(label))
      .attr('fill', scope.textColor).attr('font-weight', '300').attr('x', x).attr('y', y)
      .style('font-size', fontSize.toString() + 'px').attr('text-anchor', 'middle').attr('dominant-baseline', 'middle');
  }

  // update all the labels
  updateAllLabels(labelSize) {
    try {
      let scope = this;
      if (labelSize > 0) scope.labelSize = labelSize;
      let ids = scope.label_Ids.map((x) => x);
      let lbl = scope.labelVariables.map((x) => x);

      scope.labelElements(ids, lbl);
    }
    catch (err) {
      var returnValue = {
        'status': 'failed',
        'message': err.message
      }
      return returnValue;
    }
  }


  removeLabel(group_ID) {
    try {
      let scope = this;
      if (scope.canvas.children.length != 0) {
        let drawing = document.querySelector('#' + group_ID);
        if (drawing != undefined) {
          d3.select(scope.canvas).selectAll('#' + group_ID).selectAll('#labelGroup').remove();
        }
        var returnValue = {
          'status': 'success',
          'message': 'Removed label API'
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

  removeLabels(group_ID) {
    try {
      let scope = this;
      if (scope.canvas.children.length != 0) {
        for (let i = 0; i < group_ID.length; i++) {
          let drawing = document.querySelector('#' + group_ID[i]);
          if (drawing != undefined) {
            d3.select(scope.canvas).selectAll('#' + group_ID[i]).selectAll('#labelGroup').remove();
          }
        }
        var returnValue = {
          'status': 'success',
          'message': 'Removed labels API'
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


  clearAllLabels() {
    try {
      let scope = this;
      if (scope.canvas.children.length != 0) {

        if (scope.label_Ids.length > 0) {
          scope.removeLabels(scope.label_Ids);
          scope.label_Ids = [];
          scope.labelVariables = [];
        }
        var returnValue = {
          'status': 'success',
          'message': 'Clear all labels API'
        }
        return returnValue;
      }
      else {
        var returnValue = {
          'status': 'failed',
          'message': 'ERROR : Drawing is not loaded in viewer.'
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

  // select the single element via API
  selectElement(group_ID) {
    let scope = this;
    scope.clear_pickSelection();
    if (scope.canvas.children.length != 0) {
      try {
        scope.applySelectionColor(group_ID);
      } catch {
        //console.log('Error : Invalid element id.'); 
      }
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }

  // select multiple elements via API
  selectElements(group_ID, clear) {
    let scope = this;
    if (scope.canvas.children.length != 0) {
      if (clear) {
        scope.clear_pickSelection();
      }
      for (let i = 0; i < group_ID.length; i++) {
        try {
          scope.applySelectionColor(group_ID[i]);
        } catch {
          //console.log('Error : Invalid element id.'); 
        }
      }
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }

  // highlight single element via API
  highlightedElement(group_ID) {
    // console.log("Highlighting");
    let scope = this;
    scope.clear_highlightSelection();
    if (scope.canvas.children && scope.canvas.children.length != 0) {
      try {
        scope.applyHighlightColor(group_ID);
      } catch {
        //console.log('Error : Invalid element id. [ '+String(group_ID)+' ]'); 
      }
    } else {
      console.log('Error : Model is not loaded in viewer.');
    }
  }

  // Zoom current view to the extents of all canvas elements
  zoomExtents() {
    let scope = this;
    if (scope.canvas.children.length != 0) {
      scope.multipleModelPosition();
    } else {
      console.log('Error : Model is not loaded in viewer.');
    }
  }

  // Zoom current view to the extents of the selected elements
  // svg width height in pixel not in percentage.
  zoomSelection(group_ID) {
    let scope = this;
    var object, tempObjects = [];
    if (group_ID != '') {
      if (scope.canvas.children.length != 0) {
        if (d3.select(scope.canvas).selectAll('#' + group_ID).size() > 1) {
          d3.select(scope.canvas).selectAll('#' + group_ID).each(function () {
            object = d3.select(this).node().getBBox();
            tempObjects.push(object);
          });
          scope.zoomMultiple(tempObjects);
        }
        else {
          let object = d3.select(scope.canvas).selectAll('#' + group_ID).node().getBBox();
          scope.zoomRegion(object.x, object.y, object.width, object.height);
        }
      }
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }


  // Zoom current view to the extents of the elements specified by the list of group ids
  zoomToElements(group_IDs) {
    let scope = this;
    var object, tempObjects = [];
    if (group_IDs != '') {
      if (scope.canvas.children.length != 0) {
        for (let i = 0; i < group_IDs.length; i++) {
          let object = d3.select(scope.canvas).selectAll('#' + group_IDs[i]);
          if (object.size() > 1) {
            object.each(function () {
              tempObjects.push(d3.select(this).node().getBBox());
            });
          } else { tempObjects.push(object.node().getBBox()); }
        }
        if (group_IDs.length == 1) {
          scope.zoomSelection(group_IDs[0]);
        } else {
          scope.zoomMultiple(tempObjects);
        }
      }
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }

  zoomMultiple(elments,percentage = 0.95){
    let scope = this;

    const min_x = Math.min.apply(Math, elments.map(function (element) { return element.x; }));
    const max_x = Math.max.apply(Math, elments.map(function (element) { return element.x + element.width; }));

    const min_y = Math.min.apply(Math, elments.map(function (element) { return element.y; }));
    const max_y = Math.max.apply(Math, elments.map(function (element) { return element.y + element.height; }));

    const width = max_x-min_x;
    const height = max_y-min_y;

    scope.zoomRegion(min_x, min_y, width, height, percentage);
  }

  zoomRegion(min_x, min_y, width, height, percentage = 0.95) {
    let scope = this;
    
    const canvasWidth = scope.canvas.offsetWidth;
    const canvasHeight = scope.canvas.offsetHeight;
    const scale = percentage / Math.max(width / canvasWidth, height / canvasHeight);

    d3.select(scope.canvas.children[0]).transition().duration(550)
      .call(scope.zoom.transform, d3.zoomIdentity
        .translate(canvasWidth / 2, canvasHeight / 2)
        .scale(scale)
        .translate(-(min_x + width / 2), -(min_y + height / 2))
      );

  }

  clearElementStyle(element) {
    if (element.getAttribute("data-isDrawing") == 'true') 
    {
      d3.select(element).style('fill', '').style('stroke', '').style('opacity', '').attr('name', null).attr('color', null);
    }
  }

  // Restore the elements default graphics
  resetElement(group_ID) {
    // console.log("Reset Element");
    let scope = this;
    if (scope.canvas.children.length != 0) {
      try {
        if (d3.select(scope.canvas).selectAll('#' + group_ID).attr('label') == 'attached') {
          d3.select(scope.canvas).selectAll('#' + group_ID).selectAll('text').remove();
          d3.selectAll('#' + group_ID).attr('label', null);
        }
        if (d3.select(scope.canvas).selectAll('#' + group_ID).attr('status') == 'locked') {
          d3.select(scope.canvas).selectAll('#' + group_ID).attr('status', null);
        }
        let element = d3.select(scope.canvas).selectAll('#' + group_ID).selectAll('*').each(function () {
          scope.clearElementStyle(this);
        })
        if (scope.isGhostColor) scope.isGhostColor = false;
      }
      catch {
        //console.log('Error : Invalid element id.'); 
      }
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }

  // restore all the elements default graphics
  resetAllColors() {
    // console.log("Reset All Colors");
    let scope = this;
    if (scope.canvas.children && scope.canvas.children.length != 0) {
      d3.select(scope.canvas).selectAll('g')
        .selectAll('*').each(function () {
          scope.clearElementStyle(this);
        })

      d3.select(scope.canvas).selectAll('#background')
        .style('fill', scope.backgroundColor)

      if (scope.isGhostColor) {
        scope.isGhostColor = false;
      }
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }

  // show or hide all the elements
  showAll(status) {
    let scope = this;
    if (scope.canvas && scope.canvas.children.length != 0) {
      if (status) {
        d3.select(scope.canvas).selectAll('g').selectAll('*').style('visibility', 'visible');
      } else {
        let element = d3.select(scope.canvas).selectAll('g').selectAll('*').style('visibility', 'hidden');
      }
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }

  // reset all the elements to its original behaviour
  resetAll() {

    let scope = this;
    if (scope.canvas && scope.canvas.children.length != 0) {
      let element = d3.select(scope.canvas).selectAll('g').each(function () {
        if (d3.select(this).attr('id') == 'labelGroup') {
          d3.select(this).remove();
        }
        if (d3.select(this).attr('status') == 'locked') {
          d3.select(this).attr('status', null);
        }
      });
      d3.selectAll('g').selectAll('*').each(function () {
        scope.clearElementStyle(this);
      })
      if (scope.isGhostColor) scope.isGhostColor = false;
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }

  // Clears all the elements and associated geometry from a canvas
  clearAll() {
    let scope = this;
    if (scope.canvas && scope.canvas.children.length != 0) {
      d3.select(scope.canvas).selectAll('*').remove();
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }

  // Delete all elements from a canvas that share the provided drawing id
  removeDrawing(drawing_ID) {
    let scope = this;
    if (scope.canvas && scope.canvas.children.length != 0) {
      d3.select(scope.canvas).selectAll('#' + drawing_ID).remove();
    } else { console.log('Error : Model is not loaded in viewer.'); }
  }

  existsInArrayWhile(arr, targetElem) {
    let i = 0
    while (i < arr.length) {
      if (arr[i] === targetElem) return true
      i++
    }
    return false
  }

  toSvgString() {
    let scope = this;

    return d3.select(scope.canvas).select('svg').node().parentNode.innerHTML;
  }

  setDigits(value){
    const factor = Math.pow(10,this.digits);
      let val = value;
      if(!isNaN(value)) val = Math.round(value*factor)/factor;
      return val;
    }

}
export { Viewer };
