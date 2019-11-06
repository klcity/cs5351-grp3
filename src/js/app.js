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
    svg.viewBox.baseVal.x = r.x;
    svg.viewBox.baseVal.y = r.y;
    svg.viewBox.baseVal.width = r.width;
    svg.viewBox.baseVal.height = r.height;
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

