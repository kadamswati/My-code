import * as d3 from "d3";
import { curveBasisOpen } from "d3";

class FileLoader {
  constructor(viewerInstance) {
    this.registered = {};
    this.viewer = viewerInstance;
    this.setCanvasToViewBox();
  }

  addEventListener(name, callback) {
    if (!this.registered[name]) this.registered[name] = [];
    this.registered[name].push(callback);
  }
  triggerEvent(name, args) {
    this.registered[name].forEach((fnc) => fnc.apply(this, args));
  }

  setCanvasToViewBox() {
    let scope = this;
    d3.select(scope.viewer.canvas).selectAll('*').remove();
    scope.viewer.zoom = d3.zoom();
    var dimensions = '0 0 ' + scope.viewer.canvas.offsetWidth + ' ' + scope.viewer.canvas.offsetHeight;
    var svg = d3.select(scope.viewer.canvas)
      .append('svg')
      .attr('viewBox', dimensions)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .call(scope.viewer.zoom.on('zoom', zoomed))
      .append('g')
      .attr('id', 'parentG' + scope.viewer.canvas.id);
    function zoomed(e) {
      svg.attr('transform', e.transform);
    }
  }

  //Add Drawings
  //Accepts multiple drawings for single viewer
  addModel(files) {
    let scope = this;
    let svgFile = files;
    if (svgFile) {
      for (let i = 0; i < svgFile.length; i++) {
        scope.svgURL = URL.createObjectURL(svgFile[i]);

        d3.svg(scope.svgURL).then((data) => {

          d3.select(scope.viewer.canvas.children[0].firstChild).append('g')
            .attr('id', 'group').node().append(data.documentElement);
          
          //seems to help infinit loader error
          //must be a more elegand way...
          setTimeout(() => {
          if (i == svgFile.length - 1) {
            scope.viewer.multipleModelPosition();
            this.triggerEvent('load-finished');
          }
          }, 300);
          scope.viewer.setSvgParameters();
        });
      }
    }
  }


}

export { FileLoader };
