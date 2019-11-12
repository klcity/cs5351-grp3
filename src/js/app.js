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
    };
    /** /
    this.data.codestr = placeholder;
    /*/
this.data.codestr = `class A
+attr:int

class B
+attr:int`;
     /**/

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
    let sr = svg.getBBox();

    svg.viewBox.baseVal.x      = sr.x - sr.width /2;
    svg.viewBox.baseVal.y      = sr.y - sr.height/2;
    svg.viewBox.baseVal.width  = sr.width  * 2;
    svg.viewBox.baseVal.height = sr.height * 2;

  } // end resetViewBox()
  input()
  {
    try
    {
      let parser = new Parser();
      let model = parser.parse(this.codestr);

      if (model.length > 0) {
        
        let drawer = new Drawer();
        let graph = drawer.generateGraph(model);

        this.$data.graph = graph;
        // console.log(graph);
        // window.g= graph;

      } else {

        // TODO: Show "There is no graph"
        // debugger;

      }
	  
	  this.$data.errMsg = parser.getErrorMsg();

    } catch (ex) {
      // TODO:: Show Error Messages to users,
      // tell them what is wrong in their syntax
      console.log('ERROR', ex);
    }

  } // end input()

  wheelHandle(e) {
    let root = document.querySelector(this.$options.el);
    let svg = root.querySelector('svg');

    let rect = e.currentTarget.getBoundingClientRect();
    let cx = (e.pageX - rect.x) / rect.width;
    let cy = (e.pageY - rect.y) / rect.height;

    let ox = svg.viewBox.baseVal.x;
    let oy = svg.viewBox.baseVal.y;
    let ow = svg.viewBox.baseVal.width;
    let oh = svg.viewBox.baseVal.height;

    let nw = e.deltaY > 0 ? ow * 1.1 : ow / 1.1;
    let nh = e.deltaY > 0 ? oh * 1.1 : oh / 1.1;
    let nx = (ow - nw) * cx + ox;
    let ny = (oh - nh) * cy + oy;

    svg.viewBox.baseVal.x      = nx;
    svg.viewBox.baseVal.y      = ny;
    svg.viewBox.baseVal.width  = nw;
    svg.viewBox.baseVal.height = nh;

  }
  mouseDown(e) {
    let root = document.querySelector(this.$options.el);
    let svg = root.querySelector('svg');

    let pt = svg.createSVGPoint();
    let ctm = svg.getScreenCTM();
    pt.x = e.pageX;
    pt.y = e.pageY;

    let op = pt.matrixTransform(ctm);
    let oSvgVbx = svg.viewBox.baseVal.x + op.x;
    let oSvgVby = svg.viewBox.baseVal.y + op.y;

    console.log(pt, op);

    function _move(e) {
      pt.x = e.pageX;
      pt.y = e.pageY;
      let dp = pt.matrixTransform(ctm);
      svg.viewBox.baseVal.x = oSvgVbx - dp.x;
      svg.viewBox.baseVal.y = oSvgVby - dp.y;
    }
    window.addEventListener('mousemove', _move);
    window.addEventListener('mouseup', (e) => {
      window.removeEventListener('mousemove', _move);
    }, { once: true });

  }

}

let app = new App();
let vue = new Vue(app);

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


// Download PNG function
function downloadPNG(){
  var svgPNG = null;
  svgPNG = document.querySelector('svg');
  var widthValue = svgPNG.getBoundingClientRect().width;
  var heightValue = svgPNG.getBoundingClientRect().height;
  var draftCanvas = document.getElementById('draftCanvas');
  svgPNG.setAttribute('width', widthValue);
  svgPNG.setAttribute('height', heightValue);
  draftCanvas.width = widthValue;
  draftCanvas.height = heightValue;
  var data = new XMLSerializer().serializeToString(svgPNG);
  var win = window.URL || window.webkitURL || window;
  var img = new Image();
  var blob = new Blob([data], {
      type: 'image/svg+xml'
  });
  var url = win.createObjectURL(blob);
  img.onload = function() {
      draftCanvas.getContext('2d').drawImage(img, 0, 0);
      win.revokeObjectURL(url);
      var uri = draftCanvas.toDataURL('image/png').replace('image/png', 'octet/stream');
      var a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = uri
      a.download = (svgPNG.id || svgPNG.getAttribute('name') || svgPNG.getAttribute('aria-label') || 'untitled') + '.png';
      a.click();
      window.URL.revokeObjectURL(uri);
      document.body.removeChild(a);
  };
  img.src = url;
}