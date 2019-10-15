'use strict';

window.C = {
  PAD: 50,
}

let placeholder = `classs A
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
      input: this.input
    };

  }

  input()
  {
    try
    {
      let parser = new Parser();
      let model = parser.parse(this.codestr);

      if (model.length > 0) {
        console.log(model);
      } else {

      }

      //this.drawer.draw(this.cvs_graphics, model);

    } catch (ex) {
      /// TODO: place
      console.log('ERROR', ex);
    }

  }

}



let app = new App();
let vue = new Vue(app);




///---- temp
function setLocation(arr)
{
  // create backward links
  arr.forEach(x => {
    if (!x.parent) return;
    if (!x.parent.children) x.parent.children = [];
    x.parent.children.push(x);
  });

  // find all roots
  let roots = arr.filter(x => null == x.parent);
  console.log(roots);

  // recursive location assignment
  assignCoord(roots, new GObj(0,0));

}
