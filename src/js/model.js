class UML_Object
{
  constructor() {
    this._attrs   = [];
    this._methods = [];
  }
  addAttribute(attr) {
    this._attrs.push(attr);
  }
  addMethod(method) {
    this._methods.push(method)
  }
  connect(obj, action_name) {
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
  }
  connect() {
    throw 'NotImplementedException: pending implement';
  }
  draw() {
    throw 'NotImplementedException: pending implement';
  }
}

// -------------------------------------
class UML_Interface extends UML_Object
{
  constructor() {
    super();
  }
  connect() {
    throw 'NotImplementedException: pending implement';
  }
  draw() {
    throw 'NotImplementedException: pending implement';
  }
}