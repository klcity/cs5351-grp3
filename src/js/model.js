class GObj
{
  constructor(base)
  {
    if (!GObj.__dict__) { GObj.__dict__ = {} };
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;

    if (base)
    {
      this.base = base;
      this.attrs   = Object.keys(base.attrs  ).map(k => base.attrs[k]);
      this.methods = Object.keys(base.methods).map(k => base.methods[k]);
      this.init(base);
      GObj.__dict__[base.name] = this;
    } else {
      this.attrs   = [];
      this.methods = [];
    }

  }
  //---- Adaptor Pattern
  get name()    { return this.base.name; }
  get parent()  {
    if (!this.base.parent) return null;
    return GObj.__dict__[this.base.parent.name]
        || new GObj(this.base.parent);
  }
  //--

  init(base)
  {
    // Set box height
    this.h = 30 + (this.attrs.length + (this.attrs.length - 1))     * 10
           + 20 + (this.methods.length + (this.methods.length - 1)) * 10
           + 20;

    // Set box width
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.font = '20px san-serif';

    let maxWordLength = -1;

    this.attrs.forEach(s => {
      let rect = context.measureText(s);
      maxWordLength = Math.max(maxWordLength, rect.width);
    });
    this.methods.forEach(s => {
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
         + this.attrs.length * C.AttributeLineHeight
         + C.AttributeLineHeight / 2;
  }

  get ParentDrawPath()
  {
    const R = 10;                    // arrow size
    const deg30 = Math.PI / 6;      // half triangle theta
    const ml = R * Math.cos(deg30); // triangle height

    let ox = this.x, oy = this.Y;
    let px = this.parent.x;
    let py = this.parent.Y + this.parent.h;
    let lx=px, ly=py;
    let rx=px, ry=py;
    let mx=px, my=py;
    
    let theta = Math.atan2(oy-py, ox-px);
    lx += Math.cos(theta + deg30) * R;
    ly += Math.sin(theta + deg30) * R;
    rx += Math.cos(theta - deg30) * R;
    ry += Math.sin(theta - deg30) * R;

    mx += Math.cos(theta) * ml;
    my += Math.sin(theta) * ml;

    return `
    M${ox},${oy}
    L${mx},${my}
    L${lx},${ly}
    L${px},${py}
    L${rx},${ry}
    L${mx},${my}
    `.replace(/\s+/g, ' ');
  }

}

class UML_Object
{
  constructor() {
	
    this.name = "";
    this.attrs   = {};
    this.methods = {};
    this.assocs  = {};
    this.parent  = null;
  }
  addAttribute(attr) {
    if (this.attrs[attr.name]) {
      // TODO: change all error messages into standardised object,
      //       which provides information for the text parser, and display
      //       error messages to the users.
      throw 'Attribute name already declared';
    }
    this.attrs[attr.name] = attr;
  }
  addMethod(method) {
    if (this.methods[method.name]) {
      throw 'Method already declared';
    }
    this.methods[method.name] = method;
  }
  connect(obj, action_name) {
    this.assocs[obj.name] = action_name;
  }
  extends(obj) {
    throw 'NotImplementedException: must be implemented by the subclass';
  }
}

// -------------------------------------
class UML_Class extends UML_Object
{
  constructor() {
    super();
    this.interfaces = [];
  }
  extends(obj) {
    if (!(obj instanceof UML_Class)) {
      throw 'Class must extends another class only';
    }
    this.parent = obj;
  }
  implements(obj) {
    if (!(obj instanceof UML_Interface)) {
      throw 'Only interfaces can be implemented';
    }
    // TODO: search whether the interface is already implemented
    this.interfaces.push(obj);
  }
}

// -------------------------------------
class UML_Interface extends UML_Object
{
  constructor() {
    super();
  }
  extends(obj) {
    if (!(obj instanceof UML_Interface)) {
      'An interface can only inherits another interface';
    }
    this.parent = obj;
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
