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
  draw(g)
  {
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
  draw(g) {
    throw 'NotImplementedException: pending implement';
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
  draw(g) {
    throw 'NotImplementedException: pending implement';
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
}
