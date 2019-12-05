describe("Parser", function() {
  var parser;

  beforeEach(function() {
    parser = new Parser();
  });

  describe("Class Parser", function(){
	
	var txtstr;
	var arr;
	
	beforeEach(function() {
		txtstr = "class A" + '\n' + "+attr1:int";
		arr = [];	
		
	});
	
	it("should create a class object for one single class object input", function() {
		
		txtstr = "class A" + '\n' + "+attr1:int";
		
		arr = parser.parse(txtstr);		

		expect(arr.length).toEqual(1);
		
		expect(arr[0].name).toEqual("A");

		expect(arr[0].attrs.$attr1.name).toEqual("attr1");
		expect(arr[0].attrs.$attr1.type).toEqual("int");
		expect(arr[0].attrs.$attr1.modifier).toEqual("+");
	});
	

	it("should create an interface object for one single interface object input", function() {
	
	txtstr = "interface B" + '\n' + "+method1():void";
	
	arr = parser.parse(txtstr);		

	expect(arr.length).toEqual(1);
	
	expect(arr[0].name).toEqual("B");

	expect(arr[0].methods.$method1.name).toEqual("method1");
	expect(arr[0].methods.$method1.type).toEqual("void");
	expect(arr[0].methods.$method1.modifier[0]).toEqual("+");
	expect(arr[0].methods.$method1.parameters.length).toEqual(0);
	
	});

	it("should create both class and interface object(s) for an input including classes and interfaces", function() {
	
	txtstr = "class A" + '\n' + "+attr1:int" + '\n' + "interface B" + '\n' + "+method1():void";
	
	arr = parser.parse(txtstr);		

	expect(arr.length).toEqual(2);

	expect(arr[0].name).toEqual("A");

	expect(arr[0].attrs.$attr1.name).toEqual("attr1");
	expect(arr[0].attrs.$attr1.type).toEqual("int");
	expect(arr[0].attrs.$attr1.modifier).toEqual("+");

	expect(arr[1].name).toEqual("B");

	expect(arr[1].methods.$method1.name).toEqual("method1");
	expect(arr[1].methods.$method1.type).toEqual("void");
	expect(arr[1].methods.$method1.modifier[0]).toEqual("+");
	expect(arr[1].methods.$method1.parameters.length).toEqual(0);
	
	});

	it("a class should be able to inherit a superclass", function() {
	
	txtstr =  "class A" + '\n' 
            + "+attr1:int" + '\n' 
            + "class B >> A" + '\n' + "+method1():void";
	
	arr = parser.parse(txtstr);		

	expect(arr.length).toEqual(2);

	expect(arr[0].name).toEqual("A");

	expect(arr[0].attrs.$attr1.name).toEqual("attr1");
	expect(arr[0].attrs.$attr1.type).toEqual("int");
	expect(arr[0].attrs.$attr1.modifier).toEqual("+");

	expect(arr[1].name).toEqual("B");
	expect(arr[1].parent).toEqual(arr[0]);

	expect(arr[1].methods.$method1.name).toEqual("method1");
	expect(arr[1].methods.$method1.type).toEqual("void");
	expect(arr[1].methods.$method1.modifier[0]).toEqual("+");
	expect(arr[1].methods.$method1.parameters.length).toEqual(0);
	
	});

	it("a class should be able to implement an interface", function() {
	
	txtstr = "interface A" + '\n'
			+ "+method1():void" + '\n'
            + "class B || A" + '\n' + "+method2():int";
	
	arr = parser.parse(txtstr);		

	expect(arr.length).toEqual(2);

	expect(arr[0].name).toEqual("A");
	expect(arr[0].methods.$method1.name).toEqual("method1");
	expect(arr[0].methods.$method1.type).toEqual("void");
	expect(arr[0].methods.$method1.modifier[0]).toEqual("+");
	expect(arr[0].methods.$method1.parameters.length).toEqual(0);


	expect(arr[1].name).toEqual("B");
	expect(arr[1].methods.$method2.name).toEqual("method2");
	expect(arr[1].methods.$method2.type).toEqual("int");
	expect(arr[1].methods.$method2.modifier[0]).toEqual("+");
	expect(arr[1].methods.$method2.parameters.length).toEqual(0);
	
	});


	it("a class should be able to inherit a superclass and implement interface(s)", function() {
	
	txtstr =  "class A" + '\n' 
            + "+attr1:int" + '\n' 
			+ "interface B" + '\n'
			+ "+method1():void" + '\n'
            + "class C >> A || B" + '\n' + "+method2():int";
	
	arr = parser.parse(txtstr);		

	expect(arr.length).toEqual(3);

	expect(arr[0].name).toEqual("A");

	expect(arr[0].attrs.$attr1.name).toEqual("attr1");
	expect(arr[0].attrs.$attr1.type).toEqual("int");
	expect(arr[0].attrs.$attr1.modifier).toEqual("+");

	expect(arr[1].name).toEqual("B");

	expect(arr[1].methods.$method1.name).toEqual("method1");
	expect(arr[1].methods.$method1.type).toEqual("void");
	expect(arr[1].methods.$method1.modifier[0]).toEqual("+");
	expect(arr[1].methods.$method1.parameters.length).toEqual(0);

	expect(arr[2].name).toEqual("C");
	expect(arr[2].parent).toEqual(arr[0]);
	expect(arr[2].interfaces[0].name).toEqual("B");

	expect(arr[2].methods.$method2.name).toEqual("method2");
	expect(arr[2].methods.$method2.type).toEqual("int");
	expect(arr[2].methods.$method2.modifier[0]).toEqual("+");
	expect(arr[2].methods.$method2.parameters.length).toEqual(0);
	
	});

	it("should not create a class if multiple inheritance is input", function() {
	
	txtstr =  "class A" + '\n' 
            + "+attr1:int" + '\n' 
			+ "class B" + '\n'
			+ "+method1():void" + '\n'
            + "class C >> A >> B" + '\n';
	
	arr = parser.parse(txtstr);		

	expect(arr.length).toEqual(2);

	expect(arr[0].name).toEqual("A");

	expect(arr[0].attrs.$attr1.name).toEqual("attr1");
	expect(arr[0].attrs.$attr1.type).toEqual("int");
	expect(arr[0].attrs.$attr1.modifier).toEqual("+");

	expect(arr[1].name).toEqual("B");

	expect(arr[1].methods.$method1.name).toEqual("method1");
	expect(arr[1].methods.$method1.type).toEqual("void");
	expect(arr[1].methods.$method1.modifier[0]).toEqual("+");
	expect(arr[1].methods.$method1.parameters.length).toEqual(0);

	expect(parser.out_err.length).toEqual(1);
	expect(parser.out_err[0]).toContain("Invalid inheritenance! Only one superclass allowed.");
	
	});

	it("should not create a class if implementation goes before inheritance", function() {
	
	txtstr =  "class A" + '\n' 
            + "+attr1:int" + '\n' 
			+ "interface B" + '\n'
			+ "+method1():void" + '\n'
            + "class C || B >> A" + '\n';
	
	arr = parser.parse(txtstr);		

	expect(arr.length).toEqual(2);

	expect(arr[0].name).toEqual("A");

	expect(arr[0].attrs.$attr1.name).toEqual("attr1");
	expect(arr[0].attrs.$attr1.type).toEqual("int");
	expect(arr[0].attrs.$attr1.modifier).toEqual("+");

	expect(arr[1].name).toEqual("B");

	expect(arr[1].methods.$method1.name).toEqual("method1");
	expect(arr[1].methods.$method1.type).toEqual("void");
	expect(arr[1].methods.$method1.modifier[0]).toEqual("+");
	expect(arr[1].methods.$method1.parameters.length).toEqual(0);

	expect(parser.out_err.length).toEqual(1);
	expect(parser.out_err[0]).toContain("Invalid association! Inheritance first, then interface implementation.");
	
	});


	
  });  

});
