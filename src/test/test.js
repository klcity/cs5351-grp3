
// *************** //
// Global Constant //
// *************** //

let C = {
  PAD: 50,
  ClassNameHeight: 30,
  AttributeLineHeight: 20,
  MethodLineHeight: 20,
};

// ********************************************* //
// Create Sample UML Class Ojbect - For Test Run //
// ********************************************* //

// UML Class
class UML_Class
{
  constructor(name) {
    this.attrs   = [];
    this.methods = [];
    this.assocs  = [];
    this.parent  = null;
    this.name = name;
  }
}
// -------------------------------------
class UML_Attribute
{
  constructor(modifier, name, type)
  {
    this.modifier = modifier;
    this.name = name;
    this.type = type;
  }

  toString()
  {
    return `${this.modifier} ${this.name}:${this.type}`;
  }
}

// -------------------------------------
class UML_Method
{
  constructor(modifier, name, type)
  {
    this.modifier = modifier;
    this.name = name;
    this.parameters = [];
    this.type = type; // return type
  }

  addParam(type, name)
  {
    this.parameters.push({type: type, name: name});
  }

  toString()
  {
    let param = this.parameters.map(
      x => `${x.type} ${x.name}`
    ).join(', ');
    return `${this.modifier} ${this.name}(${param}):${this.type}`;
  }

}

// Create sample UML Object
let uml_O = [];
for (var i = 0; i < 10; i++)
{
  uml_O.push(new UML_Class(`C${i}`));
}

// Assign random parent
uml_O[1].parent = uml_O[0];
if (Math.round(Math.random()) == 0){
  uml_O[2].parent = uml_O[Math.round(Math.random())];
}
uml_O[3].parent = uml_O[Math.round(Math.random())*2];
uml_O[4].parent = uml_O[Math.round(Math.random())*3];
uml_O[5].parent = uml_O[Math.round(Math.random())*4];
uml_O[6].parent = uml_O[Math.round(Math.random())*5];
uml_O[7].parent = uml_O[Math.round(Math.random())*6];
uml_O[8].parent = uml_O[Math.round(Math.random())*7];
uml_O[9].parent = uml_O[Math.round(Math.random())*8];

// Input random text to attributes and methods
uml_O.forEach(x => {
    var age = new UML_Attribute('+', 'age', 'int');

    x.attrs.push(age);
    if (Math.random() < 0.5) {
        var gender = new UML_Attribute('~', 'gender', 'string');
        x.attrs.push(gender);
    }
    if (Math.round(Math.random()) == 1) {
        var name = new UML_Attribute('+', 'name', 'string');
        x.attrs.push(name);
    }
    if (Math.round(Math.random()) == 0) {
        var gender2 = new UML_Attribute('~', 'height', 'int');
        x.attrs.push(gender2);
    }
    if (Math.round(Math.random()) == 1) {
        var name2 = new UML_Attribute('+', 'weight', 'int');
        x.attrs.push(name2);
    }


    /**/
    var cookFood = new UML_Method('#', 'cookFood', 'int');
    cookFood.addParam('int', 'no_of_dishes');
    x.methods.push(cookFood);

    if (Math.round(Math.random()) == 0) {
      var eatBreakfast = new UML_Method('+', 'eatBreakfast', 'void');
      eatBreakfast.addParam('bool', 'cook');
      eatBreakfast.addParam('string', 'meat'); 
      eatBreakfast.addParam('bool', 'with_egg');
      x.methods.push(eatBreakfast);
    }
    if (Math.round(Math.random()) == 1) {
      var takeShower = new UML_Method('-', 'takeShower', 'date');
      x.methods.push(takeShower);
    }
    if (Math.round(Math.random()) == 0) {
      var eatBreakfast2 = new UML_Method('+', 'eatLunch', 'string');
      eatBreakfast2.addParam('bool', 'cook');
      eatBreakfast2.addParam('string', 'meat'); 
      x.methods.push(eatBreakfast2);
    }
    if (Math.round(Math.random()) == 1) {
      var takeShower2 = new UML_Method('-', 'doHomework', 'string');
      x.methods.push(takeShower2);
    }
    /**/
});
// ********** //
// GObj Class //
// ********** //

class GObj
{
  constructor(base)
  {
    if (!GObj.__dict__) { GObj.__dict__ = {} };
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    if (base) {
      this.base = base;
      this.init(base);
      GObj.__dict__[base.name] = this;
    }
  }
  //---- Adaptor Pattern
  get name()    { return this.base.name;    }
  get attrs()   { return this.base.attrs;   }
  get methods() { return this.base.methods; }
  get parent()  {
    if (!this.base.parent) return null;
    return GObj.__dict__[this.base.parent.name]
        || new GObj(this.base.parent);
  }
  //--

  init(base)
  {
    // Set box height
    this.h = 30 + (base.attrs.length + (base.attrs.length - 1))     * 10
           + 20 + (base.methods.length + (base.methods.length - 1)) * 10
           + 20;

    // Set box width
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.font = '20px san-serif';

    let maxWordLength = -1;

    base.attrs.forEach(s => {
      let rect = context.measureText(s);
      maxWordLength = Math.max(maxWordLength, rect.width);
    });
    base.methods.forEach(s => {
      let rect = context.measureText(s);
      maxWordLength = Math.max(maxWordLength, rect.width);
    });
    maxWordLength = Math.max(
      maxWordLength,
      context.measureText(base.name).width
    );

    this.w = maxWordLength;
  }
  get X() { return this.x - this.w/2; }
  get Y() { return this.y - this.h/2; }

  get ClassNameSeparatorY() {
    return this.Y + C.ClassNameHeight;
  }
  get AttributesSeparatorY() {
    return this.ClassNameSeparatorY
         + this.base.attrs.length * C.AttributeLineHeight
         + C.AttributeLineHeight / 2;
  }

}

// *************************************** //
// Convert UML Class Ojbect to GObj Object //
// *************************************** //

let arr = uml_O.map( z => new GObj(z) );

// ************ //
// Drawer Class //
// ************ //

class Drawer
{
  draw(arr){
    this.setLocation(arr);
  };

  setLocation(arr)
  {
    // create backward links
    arr.forEach(x => {
      if (!x.parent) return;
      if (!x.parent.children) x.parent.children = [];
      x.parent.children.push(x);
    });
  
    // find all roots
    let roots = arr.filter(x => null == x.parent);
  
    // recursive location assignment
    this.assignCoord( roots, new GObj() );
  };

  assignCoord(items, /*center*/ o)
  {
    let totalWidth = items.map(x => this.estimateWidth(x)).reduce((a,b) => a+b);
    let curX = o.x + o.w/2;
    curX += ( (items.length - 1) * C.PAD + totalWidth) / -2;
  
    items.forEach(i => {
      i.x = curX + (this.estimateWidth(i)-o.w)/2;
      i.y = o.y + C.PAD + (i.h + o.h)/2;
      curX += this.estimateWidth(i) + C.PAD;
    });
  
    items.forEach(i => {
      if (i.children) this.assignCoord(i.children, i);
    });
  };

  estimateWidth(o){
    if (o.ew) return o.ew;
    if (!o.children) return o.ew = o.w;
    else switch (o.children.length)
    {
      case 0:
        return o.ew = o.w;
      case 1:
        return o.ew = Math.max(o.w, o.children[0].w);
      default:
        return o.ew = o.children.reduce((r, x) =>
            r + this.estimateWidth(x) + C.PAD
          , -C.PAD);
    }
  }
}

// ***************************************** //
// Create Drawer Object and draw GObj Object //
// ***************************************** //


var drawer = new Drawer();
drawer.draw(arr);

new Vue({
  el: '#app',
  data: {
    rect: arr
  },
  methods: {
    resetViewbox: function() {
      let root = document.querySelector(this.$options.el);
      let svg = root.querySelector('svg');
      if (!svg) return;
      let r = svg.getBBox();
      svg.viewBox = `${r.x} ${r.y} ${r.width} ${r.height}`;
    }
  },
  created: function() {
    this.resetViewbox();
  },
  updated: function() {
    this.resetViewbox();
  }
});

