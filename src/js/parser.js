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
        if (obj) { 
		    if (obj.name.length > 0)
				arr.push(obj); 
		}
      }

    }
    catch (ex)
    {
      // TODO: show exception message thrown by the parsers
	  console.log(ex.message);
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
	  return false;
    }

    let line;
    do { 
    	line = this.lines[this.position++];
	    // stop reader if it goes to the end
    	if ('undefined' === typeof line) return false; 
    }
	while (line.length == 0)
    //while ('#' === line[0]); // skip comments

    return line.trim();
  }
  back(){
	  this.position--;
  }
}

class UML_ObjectParser
{
  createUMLMethod(vis, strArr){

    let param;
    let i;
    let arrParam = this.getMethodParam(strArr[0]);

    let objMethod = new UML_Method(vis, strArr[0].substring(0,strArr[0].indexOf('(')).trim(), strArr[1].trim());

    for (i=0; i<arrParam.length; i++){
        param = arrParam[i].trim().split(' ');
        objMethod.addParam(param[0].trim(), param[1].trim());
    }

    return objMethod;

  }

  createUMLAttribute(vis, strArr){

    let objAttribute = new UML_Attribute(vis, strArr[0].trim(), strArr[1].trim());

    return objAttribute;

  }

  lookUpObjectByName(str){

    let i;
    for (i=0; i<arr.length; i++){
        if (arr[i].name == str){
            return arr[i];
        }
    }
    return null;
  }

  splitAssociationString(str){

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

  getVisibility(str){
	
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

  getMethodOrAttr(str){
	
	// attribute / method name and type (separated by ':') 
	let attr_method_name = str.substring(1,str.length).trim();
	
	let strs;
	if (attr_method_name.length > 0){
		strs = attr_method_name.split(':');
	}
	
	return strs;
}

  isMethod(str){
	
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

  getMethodParam(str){
	
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
  
  checkOnlyOneExtend(str){
	str = str.trim();
    var regex_1 = str.match(/[>]{2}/g); // define only can have one >> characters under string
    var regex_2 = str.match(/[>]/g);	

	var res = true;
	
	if(str[0].match(">") || str[str.length-1].match(">"))
		res = false;
	else if (regex_1 || regex_2)
	{
		if (regex_2.length != 2)
			res = false;
		else if (regex_1.length != 1)
			res = false;
	}
    return res;    
  }

}

// -------------------------------------
class UML_ClassParser extends UML_ObjectParser
{
  read(reader)
  {
	console.log( "UML_ClassParser.read()");

    // read and create Class Object
	let obj = new UML_Class();
	reader.back();
	
	let headerline = true;
	
    let line;
	let classDef;
	let assoDef;
	let i;
    while (line = reader.read()){

		if (headerline){ 
			if (this.validateAssociationLine(line)){
				let associationIdx = this.splitAssociationString(line);
				
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
					
					let assoArr = this.defineAssociationObj(assoDef);
					console.log(assoArr.length);	
					

					if (assoArr.length > 0){ // has interface but no super class
						superclass = assoArr[0].substring(3,assoArr[0].length).trim();
						assobj = this.lookUpObjectByName(superclass);
						if (assobj)
						{
							obj.extends(assobj);
						}
					}
					
					for (i=1; i < assoArr.length; i++){		// Interface				
						assoname = assoArr[i].trim();	
						assobj = this.lookUpObjectByName(assoname);
						if (assobj)
						{
							obj.implements(assobj);
						}					
					}
				}
			}
		}else{
			// parse line
			if (ParserUtil.validateClassLine(line)){
				
				let vis = this.getVisibility(line);
				if (vis.length == 0) {
					reader.back();
					break; 
				}
				
				let attr_method = this.getMethodOrAttr(line);
				
				let bmethod = this.isMethod(attr_method[0]);
				
				if (bmethod){
					obj.addMethod(this.createUMLMethod(vis[0], attr_method));
				}else{
					obj.addAttribute(this.createUMLAttribute(vis[0], attr_method));
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
  
  defineAssociationObj(str){

    let i;
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
  
 validateAssociationLine(str){

  /*
    (1) can have >> or || on the line
    (2) can only have one >>
    (3) can be multiple ||
    (4) must be separated by a name in between
    (5) >> must go first, then multiple || follows
  */
	
	var res = true;
	// (2) can only have one >>
	res = this.checkOnlyOneExtend(str);
	
	// (3) can have multiple ||	
    // (4) must be separated by a name in between
	if (res)
		res = this.checkMultipleImplement(str);
	
	// (5) >> must go first, then multiple || follows
	if (res) {
	var a = str.indexOf(">>");
	var b = str.indexOf("||");
	
	if (a>0 || b>0)
		res = (a < b);
	}
	
	return res;
 }  

 checkMultipleImplement(str){
	str = str.trim();
    var regex_1 = str.match(/[|]{2}/g); // define only can have one >> characters under string
    var regex_2 = str.match(/[|]/g);	
	var a = str.split('||');

	var res = true;
	
	if (regex_1 || regex_2)
	{
		if (regex_2.length%2 != 0)
			res = false;
		else {
			var n = regex_1.length;
			var i;
			if (n == a.length-1){
				for (i=1; i<a.length; i++){
					if (a[i].trim().length == 0)
						res = false;
				}					
			}else{
				res = false;
			}
		}
	}
    return res;    
  } 

}

// -------------------------------------
class UML_InterfaceParser extends UML_ObjectParser
{
  read(reader)
  {
	console.log( "UML_InterfaceParser.read()");
    // read and create Class Object
	let obj = new UML_Interface();
	reader.back();
	
	let headerline = true;
	
    let line;
	let classDef;
	let assoDef;	

    while (line = reader.read()){
		if (headerline){ 
			if (this.validateAssociationLine(line)){
				let associationIdx = this.splitAssociationString(line);
				
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
					assobj = this.lookUpObjectByName(superclass);
					if (assobj)
					{
						obj.extends(assobj);
					}
				}			
			}
		}else{
			// parse line
			if (ParserUtil.validateInterfaceLine(line)){
				
				// must be '+'
				let vis = this.getVisibility(line);
				if (vis.length == 0) {
					reader.back();
					break; 
				}
				let attr_method = this.getMethodOrAttr(line);

				obj.addMethod(this.createUMLMethod(vis, attr_method));
				
			}else{
				// Error Handling
				// TODO:
			}			
		}
	}
	console.log(obj);
	return obj;
    
  }

  validateAssociationLine(str){
	  
	/*
		(1) can only have one >>
		(2) must be separated by a name in between
	*/
	var res = this.checkOnlyOneExtend(str);
	
	return res;
	 
  }
}

class ParserUtil
{

static validateClassAssociationLine(str){
	// Pending implementation
	// TODO:
	/*
		(1) can have >> or || on the line
		(2) can only have one >>
		(3) can be multiple ||
		(4) must be separated by a name in between
		(5) >> must go first, then multiple || follows
	*/
	/*
	let x = 0;
	let y = 0;
	let j = 0;

	// meet (1) requirements
	for(j=0; j<str.length; j++) {
		if(str[j].match(">")) {
			x++;
		}
		if(str[j].match("|")) {
			y++;
		}
	}
	let z = y%2;
	if(x<=1 || x>=3 || y<=1 || z!=0)
		return false;

	var regex_1 = /[>]{2}/; // define only can have one >> characters under string

	if(str[0].match(">") || str[str.length-1].match(">"))
			return false;
	if(!(str.match(regex_1)))
			return false;
	*/
	return true;

}

static validateInterfaceAssociationLine(str){
	// Pending implementation
	// TODO:
	/*
		(1) can only have one >>
		(2) must be separated by a name in between
	*/
	
	var regex_1 = /[>]{2}/; // define only can have one >> characters under string

	if(str[0].match(">") || str[str.length-1].match(">"))
		return false;
	if(!(str.match(regex_1)))
		return false;

/*
	let x = 0;
	for(j=0; j<str.length; j++) {
		if(str[j].match(">")) {
			x++;
		}
			
	}
	if(x<=1 || x>=3)
		return false;

		return true; // final return true value
*/
	//return true;

	
}

static validateClassLine(str){
	// Pending implementation
	// TODO:
	/*
		(1) modifier must be + - # ~
		(2) name must not contain special characters except _ and $
		(3) type must be int / string / double / date / boolean / byte / char / short / long / float / void
	*/
	return true;
}


static validateInterfaceLine(str){
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


}
function myFunction() {
  var x = document.getElementById("txt-syntax");

  document.getElementById("sec-output").innerHTML = x.value;
  //var obj = new UML_InterfaceParser();
  //var abc = obj.validateAssociationLine("interface Professor >> Person  ");
  var obj = new UML_ClassParser();
  var abc = obj.validateAssociationLine("class Professor >> Person ||ILicenseTest|| IExpatriate ");
  if (abc == Boolean('true'))
	window.alert("True")
	else
	window.alert("False");
}

function clearFunction() {
	document.getElementById("txt-syntax").value = "";
	document.getElementById("sec-output").innerHTML = "";
}
