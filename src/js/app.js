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

    this.methods = {
      input: this.input,
      resetViewbox: this.resetViewbox,
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
    let r = svg.getBBox();
    // Default display size is set to 800 by 800
    // Anything smaller than 800 by 800 in width or height will by default uses the default display size
    var oriXCenter = r.x + (r.width / 2);
    var oriYCenter = r.y - (r.height / 2);
    var displayPadding = 25;
    if (r.width < 800 && r.height < 800) {
      var newX = oriXCenter - 400
      var newY = oriYCenter - 400
      svg.viewBox.baseVal.x = newX;
      svg.viewBox.baseVal.y = newY;
      svg.viewBox.baseVal.width = 800
      svg.viewBox.baseVal.height = 800;
      // Store original value
      this.maxViewBox.x = svg.viewBox.baseVal.x;
      this.maxViewBox.y = svg.viewBox.baseVal.y;
      this.maxViewBox.width = svg.viewBox.baseVal.width;
      this.maxViewBox.height = svg.viewBox.baseVal.height;
    }
    else {
      var maxLength = Math.max(r.width, r.height);
      var newX = oriXCenter - (maxLength / 2) - displayPadding;
      var newY = oriYCenter - (maxLength / 2) - displayPadding;
      svg.viewBox.baseVal.x = newX;
      svg.viewBox.baseVal.y = newY;
      svg.viewBox.baseVal.width = maxLength + displayPadding * 2;
      svg.viewBox.baseVal.height = maxLength + displayPadding * 2;
      // Store original value
      this.maxViewBox.x = svg.viewBox.baseVal.x;
      this.maxViewBox.y = svg.viewBox.baseVal.y;
      this.maxViewBox.width = svg.viewBox.baseVal.width;
      this.maxViewBox.height = svg.viewBox.baseVal.height;
    }
  }
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