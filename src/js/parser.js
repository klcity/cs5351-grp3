var arr = [];

class Parser
{
  constructor()
  {
    this.Parsers = {
      Class : new UML_ClassParser(),
      Interface : new UML_InterfaceParser(),
    };
  }

  parse(raw_syntax)
  {
    arr = [];
    let reader = new LineReader(raw_syntax);

    // TODO: read the text and construct models
    try
    {
      let line;
      while (line = reader.read())
      {
		let parsetype;
		let parseline;

		parseline = line.toLowerCase();
		
		if (parseline.includes("class ")){
			parsetype = "class";
		}else if (parseline.includes("interface ")){
			parsetype = "interface";
		}else{
			parsetype = "";
		}
			
        let obj;
        // check syntax
        switch (parsetype.trim())
        {
          // skip empty lines
          case '':
            continue;

          // switch parsers
          case 'class':
            obj = this.Parsers.Class.read(reader);
            break;
          
          case 'interface':
            obj = this.Parsers.Interface.read(reader);
            break;
          
          // other cases
          default:
            break;
        }
		// collect object
        if (obj) { arr.push(obj); }
      }

    }
    catch (ex)
    {
      // TODO: show exception message thrown by the parsers
    }
	console.log("arr size: " + arr.length);
	console.log(arr);
	
    return arr;
  }
}

// -------------------------------------
class LineReader
{
  constructor(text)
  {
    this.lines = text.split('\n');
    this.position = 0;
  }
  read()
  {
    // check file end
    if (this.position > this.lines.length) {
      //throw 'EOF';
	  return false;
    }

    let line;
    do { line = this.lines[this.position++]; }
    //while ('#' === line[0]); // skip comments
    while (false); 

    // stop reader if it goes to the end
    if ('undefined' === typeof line) return false;
    return line.trim();
  }
}

// -------------------------------------
class UML_ClassParser
{
  read(reader)
  {
	console.log( "UML_ClassParser.read()");

    // read and create Class Object
	let obj = new UML_Class();
	reader.position--;
	
	let headerline = true;
	
    let line;
	let classDef;
	let assoDef;
    while (line = reader.read()){

		if (headerline){ 
			let associationIdx = splitAssociationString(line);
			
			if (associationIdx > 0){
				classDef = line.substring(0, associationIdx).trim();
				assoDef = line.substring(associationIdx, line.length).trim();
			}else{
				classDef = line.trim();
				assoDef = "";
			}
			
			let strpart = classDef.split(" ");
			if (strpart.length > 1){ // set class name			
				obj.name = strpart[1].trim();
				headerline = false;
			}

			if (assoDef.length > 0){
				
				let assoname;	
				let assobj;
				let superclass;
				
				let assoArr = defineAssociationObj(assoDef);
				console.log(assoArr.length);	
				

				if (assoArr.length > 0){ // has interface but no super class
					superclass = assoArr[0].substring(3,assoArr[0].length).trim();
					assobj = lookUpObjectByName(superclass);
					if (assobj)
					{
						obj.extends(assobj);
					}
				}
				
				for (var i=1; i < assoArr.length; i++){		// Interface				
					assoname = assoArr[i].trim();	
					assobj = lookUpObjectByName(assoname);
					if (assobj)
					{
						obj.implements(assobj);
					}					
				}
			}

		}else{
			// parse line
			if (validateClassLine(line)){
				
				let vis = getVisibility(line);

				let attr_method = getMethodOrAttr(line);
				
				let bmethod = isMethod(attr_method[0]);
				
				if (bmethod){
					obj.addMethod(createUMLMethod(vis[0], attr_method));
				}else{
					obj.addAttribute(createUMLAttribute(vis[0], attr_method));
				}
				
			}else{
				// Error Handling
				// TODO:
			}			
		}
	}
	console.log(obj);
	return obj;
	
    //throw `Error found on line ${lineNumber}`;

  }
}

// -------------------------------------
class UML_InterfaceParser
{
  read(reader)
  {
	console.log( "UML_InterfaceParser.read()");
    // read and create Class Object
	let obj = new UML_Interface();
	reader.position--;
	
	let headerline = true;
	
    let line;
	let classDef;
	let assoDef;	

    while (line = reader.read()){
		if (headerline){ 
			let associationIdx = splitAssociationString(line);
			
			if (associationIdx > 0){
				classDef = line.substring(0, associationIdx).trim();
				assoDef = line.substring(associationIdx, line.length).trim();
			}else{
				classDef = line.trim();
				assoDef = "";
			}
			
			let strpart = classDef.split(" ");
			if (strpart.length > 1){ // set interface name			
				obj.name = strpart[1].trim();
				headerline = false;
			}
			
			if (assoDef.length > 0){
				
				let assoname;	
				let assobj;
				let superclass;

				superclass = assoDef.substring(3,assoDef.length).trim();
				assobj = lookUpObjectByName(superclass);
				if (assobj)
				{
					obj.extends(assobj);
				}
			}			
			
		}else{
			// parse line
			if (validateInterfaceLine(line)){
				
				// must be '+'
				let vis = '+';
				let attr_method = getMethodOrAttr(line);

				obj.addMethod(createUMLMethod(vis, attr_method));
				
			}else{
				// Error Handling
				// TODO:
			}			
		}
	}
	console.log(obj);
	return obj;
    
  }
}

function createUMLMethod(vis, strArr){
	
	let param;
	let arrParam = getMethodParam(strArr[0]);

	let objMethod = new UML_Method(vis, strArr[0].substring(0,strArr[0].indexOf('(')).trim(), strArr[1].trim());
	
	for (i=0; i<arrParam.length; i++){
		param = arrParam[i].trim().split(' ');
		objMethod.addParam(param[0].trim(), param[1].trim());
	}
	
	return objMethod;
	
}

function createUMLAttribute(vis, strArr){
	
	let objAttribute = new UML_Attribute(vis, strArr[0].trim(), strArr[1].trim());
	
	return objAttribute;
	
}

function validateClassAssociationLine(str){
	// Pending implementation
	// TODO:
	/*
		(1) can have >> or || on the line
		(2) can only have one >>
		(3) can be multiple ||
		(4) must be separated by a name in between
		(5) >> must go first, then multiple || follows
	*/
}

function validateInterfaceAssociationLine(str){
	// Pending implementation
	// TODO:
	/*
		(1) can only have one >>
		(2) must be separated by a name in between
	*/
}

function validateClassLine(str){
	// Pending implementation
	// TODO:
	/*
		(1) modifier must be + - # ~
		(2) name must not contain special characters except _ and $
		(3) type must be int / string / double / date / boolean / byte / char / short / long / float / void
	*/
	return true;
}


function validateInterfaceLine(str){
	// Pending implementation
	// TODO:
	// only accept methods
	/*
		(1) modifier must be + (public)
		(2) name must not contain special characters except _ and $
		(3) type must be int / string / double / date / boolean / byte / char / short / long / float / void
	*/
	return true;
}

function defineAssociationObj(str){
	
	let arrImp = [];
	// split the >> class and || implementations and return as array
	if (str.trim().length > 0){
		// 1. split by || first 
		// 2. the 1st element will be empty (no superclass) or >> XXX (has superclass)

		arrImp = str.split("||");
		for (i = 0; i<arrImp.length; i++){
			console.log(arrImp[i]);
		}
	}
	return arrImp;
	
}

function lookUpObjectByName(str){
	
	for (i=0; i<arr.length; i++){
		if (arr[i].name == str){
			return arr[i];
		}
	}
	return null;
}

function splitAssociationString(str){

	let regex = /\>[^>]{0}\> | \|[^|]{0}\|/;
	let asso = null;	
	let idx = -1;
	let found = str.match(regex);
	
	if (found){
		asso = found[0].trim();
		idx = str.indexOf(asso);
	}

	return idx;
	
}

function getVisibility(str){
	
	let visrx = /[\+\-\~\#]/;
	let ovis;
	
	if (str.length > 0){
		ovis = str.trim().match(visrx);
		if (ovis){
			return ovis;
		}
		return "";
	}else{
		return "";
	}
}

function getMethodOrAttr(str){
	
	// attribute / method name and type (separated by ':') 
	let attr_method_name = str.substring(1,str.length).trim();
	
	let strs;
	if (attr_method_name.length > 0){
		strs = attr_method_name.split(':');
	}
	
	return strs;
}

function isMethod(str){
	
	let bmethod = false;
	
	let methodrx = /\([^)]*\)/;
	let omethod;
	
	if (str.length > 0){
		omethod = str.trim().match(methodrx);
		if (omethod){
			bmethod = true;
		}
	}
	
	return bmethod;
}

function getMethodParam(str){
	
	let strParam;
	let params;
	let methodrx = /\([^)]*\)/;
	let omethod;
	
	if (str.length > 0){
		omethod = str.trim().match(methodrx);
	}
	if (omethod){
		strParam = omethod[0].substring(1,omethod[0].length-1);
	}
	if (strParam.trim().length > 0)
		params = strParam.trim().split(',');
	else
		params = [];
	
	return params;
}

function myFunction() {
  var x = document.getElementById("txt-syntax");
  document.getElementById("sec-output").innerHTML = x.value;
}
