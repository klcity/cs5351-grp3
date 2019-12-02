'use strict';

let placeholder = `class A
+attr:int
+method(string y):void`;

class App
{
  constructor()
  {
    this.el = '#app';

    // init model
    this.data = {
      codestr: '',
      graph: [],
      errMsg: '',
      placeholder: placeholder,
      maxViewBox: {},
      pngImageSize: {},
    };

    this.methods = {
      input: this.input,
      resetViewbox: this.resetViewbox,
      wheelHandle: this.wheelHandle,
      mouseDown: this.mouseDown,
    };

    // note that Vue cannot get in-class methods as created/updated trigger
    this.created = function() {
      this.resetViewbox();
    }
    this.updated = function() {
      this.resetViewbox();
    }

  }
  resetViewbox() {
    let root = document.querySelector(this.$options.el);
    let svg = root.querySelector('svg');
    if (!svg) return;
    let sr = svg.getBBox();
    
    this.pngImageSize = sr;

    svg.viewBox.baseVal.x      = sr.x - sr.width /2;
    svg.viewBox.baseVal.y      = sr.y - sr.height/2;
    svg.viewBox.baseVal.width  = sr.width  * 2;
    svg.viewBox.baseVal.height = sr.height * 2;

  } // end resetViewBox()
  input()
  {
    let parser = new Parser();
    try
    {
      let model = parser.parse(this.codestr);

      if (model.length > 0) {
        
        let drawer = new Drawer();
        let graph = drawer.generateGraph(model);

        this.$data.graph = graph;

      } else {

        // TODO: Show "There is no graph"
        // debugger;

      }
	  
    } catch (ex) {
      // TODO:: Show Error Messages to users,
      // tell them what is wrong in their syntax
    } finally {
      (this.$data||this.data).errMsg = parser.getErrorMsg();
    }

  } // end input()

  wheelHandle(e) {
    let root = document.querySelector(this.$options.el);
    let svg = root.querySelector('svg');

    // get mouse position ratio
    let rect = e.currentTarget.getBoundingClientRect();
    let cx = (e.pageX - rect.x) / rect.width;
    let cy = (e.pageY - rect.y) / rect.height;

    // get original SVG coordination system viewbox
    let ox = svg.viewBox.baseVal.x;
    let oy = svg.viewBox.baseVal.y;
    let ow = svg.viewBox.baseVal.width;
    let oh = svg.viewBox.baseVal.height;

    // compute new viewbox size and top-left location
    let nw = e.deltaY > 0 ? ow * 1.1 : ow / 1.1;
    let nh = e.deltaY > 0 ? oh * 1.1 : oh / 1.1;
    let nx = (ow - nw) * cx + ox; // change of x,y location = change in size * ratio of mouse pointer
    let ny = (oh - nh) * cy + oy;

    // update viewport
    svg.viewBox.baseVal.x      = nx;
    svg.viewBox.baseVal.y      = ny;
    svg.viewBox.baseVal.width  = nw;
    svg.viewBox.baseVal.height = nh;

  }
  mouseDown(e) {
    // find SVG element
    let root = document.querySelector(this.$options.el);
    let svg = root.querySelector('svg');

    // use SVG point and CTM (Current Transformation Matrix)
    let pt = svg.createSVGPoint();
    let ctm = svg.getScreenCTM();
    pt.x = e.pageX;
    pt.y = e.pageY;

    // transform the cursor point to SVG point
    let op = pt.matrixTransform(ctm);
    
    // save starting point + viewbox starting point (optimized)
    let oSvgVbx = svg.viewBox.baseVal.x + op.x;
    let oSvgVby = svg.viewBox.baseVal.y + op.y;

    function _move(e) {
      pt.x = e.pageX;
      pt.y = e.pageY;
      // transform currsor point to SVG point
      let dp = pt.matrixTransform(ctm);
      svg.viewBox.baseVal.x = oSvgVbx - dp.x; // (optimized)
      svg.viewBox.baseVal.y = oSvgVby - dp.y;
    }

    // register moving updates
    window.addEventListener('mousemove', _move);

    // register end of drag
    window.addEventListener('mouseup', (e) => {
      window.removeEventListener('mousemove', _move);
    }, { once: true });

  }

}

let app = new App();
let vue = new Vue(app);

$(document).ready(() => {
  setTimeout(() => {
    $('textarea').trigger('change');
  }, 1000);
});

// UI View functions
function svgMove(dx, dy) {
  let svg = document.querySelector('svg');
  svg.viewBox.baseVal.x += dx;
  svg.viewBox.baseVal.y += dy;
}
function svgZoomIn() {
  scale(1 / 1.1);
}
function svgZoomOut() {
  scale(1.1);
}
function scale(s) {
  let svg = document.querySelector('svg');
  svg.viewBox.baseVal.width *= s;
  svg.viewBox.baseVal.height *= s;
  svg.viewBox.baseVal.x *= s;
  svg.viewBox.baseVal.y *= s;
}
function svgReset() {
  let s = vue.maxViewBox;
  let svg = document.querySelector('svg');
  svg.viewBox.baseVal.x = s.x;
  svg.viewBox.baseVal.y = s.y;
  svg.viewBox.baseVal.width = s.width;
  svg.viewBox.baseVal.height = s.height;
}

// Print and IMage function
function imgPrint() {
  window.print();
}

function imgEmail() {

}

// Download PNG function
function downloadPNG(){
  let svg = document.querySelector('svg');
  svg.viewBox.baseVal.x = vue.pngImageSize.x - 20;
  svg.viewBox.baseVal.y = vue.pngImageSize.y - 20;

  var cvs = document.createElement('canvas');

  svg.viewBox.baseVal.width = vue.pngImageSize.width + 40;
  svg.viewBox.baseVal.height = vue.pngImageSize.height + 40;

  cvs.width = vue.pngImageSize.width;
  cvs.height = vue.pngImageSize.height;

  let data = new XMLSerializer().serializeToString(svg);
  let win = window.URL || window.webkitURL || window;
  let img = new Image();
  let blob = new Blob([data], { type: 'image/svg+xml' });
  let url = win.createObjectURL(blob);
  img.onload = function() {
    // draw image
    cvs.getContext('2d').drawImage(img, 0, 0);
    // create fake button
    let a = document.createElement('a');
    a.style = 'display: none';
    a.href = cvs.toDataURL('image/png');
    a.download = 'Class Diagram.png';
    // impersonate click
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // release objects
    win.revokeObjectURL(url);
  };
  img.src = url;
}