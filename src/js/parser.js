class Parser
{
  constructor()
  {	
    this.Parsers = {
      Class : new UML_ClassParser(),
      Interface : new UML_InterfaceParser(),
    };
	this.arr = [];
	this.out_err = [];
  }

  getErrorMsg()
  {
	  let i;
	  let out_str = "";
      for (i=0; i<this.out_err.length; i++){
		out_str = out_str + this.out_err[i] + "\n";
	  }
	  return out_str;
  }
  parse(raw_syntax)
  {
    this.arr = [];
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
      } else if (parseline.includes("interface ")) {
         parsetype = "interface";
      } else{
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
            obj = this.Parsers.Class.read(reader,this.arr);
            break;

          case 'interface':
            obj = this.Parsers.Interface.read(reader,this.arr);
            break;

          // other cases
          default:
            break;
        }
		// collect object
        if (obj) { 
		    if (obj.name.length > 0)
				this.arr.push(obj);
			
			if (obj instanceof UML_Class && this.Parsers.Class.getMessages().length > 0)
				this.out_err = this.out_err.concat(this.Parsers.Class.getMessages());

			if (obj instanceof UML_Interface && this.Parsers.Interface.getMessages().length > 0)
				this.out_err = this.out_err.concat(this.Parsers.Interface.getMessages());
		}
      }

    }
    catch (ex)
    {
  	  // TODO: show exception message thrown by the parsers
	    //throw ex;
    }

    return this.arr;
  }
}

// -------------------------------------
class UML_ObjectParser
{
  constructor() {
    this.err  = [];
  }	
	
  addMessage(str) {
    this.err.push(str);
  }
  
  getMessages() {
    return this.err;
  }
  
  createUMLMethod(vis, strArr) {

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

  createUMLAttribute(vis, strArr) {

    let objAttribute = new UML_Attribute(vis, strArr[0].trim(), strArr[1].trim());

    return objAttribute;

  }

  lookUpObjectByName(str, arr) {

    let i;
    for (i=0; i<arr.length; i++){
			if (arr[i].name == str){
					return arr[i];
			}
    }
    return null;
  }

  splitAssociationString(str) {

		let regex = /\>[^>]{0}\>|\|[^|]{0}\|/;
		let asso = null;	
		let idx = -1;
		let found = str.match(regex);
		
		if (found){
			asso = found[0].trim();
			idx = str.indexOf(asso);
		}

		return idx;
		
  }

  getVisibility(str) {
	
		let visrx = /[\+\-\~\#]/;
		
		if (str.length > 0){
			let ovis = str.trim().match(visrx);
			return ovis || "";
		}
		return "";
  }

  getMethodOrAttr(str) {
	
		// attribute / method name and type (separated by ':') 
		let attr_method_name = str.substring(1,str.length).trim();
		
		let strs;
		if (attr_method_name.length > 0){
			strs = attr_method_name.split(':');
		}
		
		return strs;
  }
  
	checkColonCorrect(str) {
		let strs = this.getMethodOrAttr(str);
		return (strs.length == 2);
  }  
  
	checkAttrLineCorrect(str) {
	
		let strs = this.getMethodOrAttr(str);
		let res = true;
		
		res = this.checkAttrNameCorrect(strs[0].trim());
		
		if (res) {
			if (strs.length == 2)
				res = this.checkAttrTypeCorrect(strs[1].trim());
			else 
				res = false;
		}
		
		return res;
	
	}

	checkAttrNameCorrect(str) {

		let namerx = /[^A-Za-z0-9_$]/;
		let oname;
		
		let s = str.trim();
		
		if (s.length > 0){
			oname = s.match(namerx);
		}
		return !oname;
		
  }

	checkAttrTypeCorrect(str) {

		let bname = true;
		let namerx = /[^A-Za-z0-9_$\[\]\<\>]/;
		let oname;
		let oname1;
		let oname2;
		let sname;
		
		let s = str.trim();
		
		if (s.length > 0){
			oname = s.match(namerx);
		}

		if (oname){
			bname = false;
		}

		if (bname){ // check []
			let namerx1 = /\[(?!\]$)/;
			let namerx2 = /(?<!\[)\]/;
			
			oname1 = s.match(namerx1);
			oname2 = s.match(namerx2);
			
			if (oname1 || oname2)
				bname = false;
		}

		if (bname){ // check <.>
			if (s.includes('<') || s.includes('>')){
				sname = this.getGenericType(s);
				if (!sname)
					bname = false;
			}
		}		

		return bname;
		
  }

  checkMethodNameCorrect(str) {
		
		let bname = true;
		let strs = this.getMethodOrAttr(str);
		let s0 = strs[0].trim();
		let namerx = /[^A-Za-z0-9_$]/;
		let oname;
		
		let s = s0.substr(0,s0.indexOf('('));
		
		if (s.length > 0){
			oname = s.trim().match(namerx);
			if (oname){
				bname = false;
			}
		}
		return bname;
		
  }    

   checkObjectNameCorrect(str){
	
	let bname = true;
	
	let namerx = /[^A-Za-z0-9_$]/;
	let oname;
	
	let s = str.trim();
	
	if (s.length > 0){
		oname = s.match(namerx);
		if (oname){
			bname = false;
		}
	}
	return bname;
	
  }   
 
  validateObjectName(line, str, arr){
	
	var res = true;
	var assobj;
	 
	res = this.checkObjectNameCorrect(str);
	if (!res) this.err.push("(" + line + ") Invalid object name! Name must not contain special characters except _ and $.");

    if (res){
		if (str.length > 0){
			assobj = this.lookUpObjectByName(str, arr);
			if (assobj)				
			{	
				res = false;
				this.err.push("(" + line + ") Duplicate object found!");
			}
		}
	}
	return res;
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
  
  getGenericType(str){
	 
	let sgen;
	
	let genericrx = /\<[^>]+\>/;
	let ogeneric;
	
	if (str.length > 0){
		ogeneric = str.trim().match(genericrx);
		
		if (ogeneric){
			sgen = ogeneric[0];
		}
	}
	
	return sgen;	 	  
	  
  }

  getMethodParam(str) {
	
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
  
  checkOnlyOneExtend(str) {

		/*
		let regExp = /^(abstract\s+)?class\s+([^>]*)(>>)([^>|]*)(\|\|\s*(([^>|,]+,?)*))?$/gi
		*/

		str = str.trim();
		let regex_1 = str.match(/[>]{2}/g); // define only can have one >> characters under string
		let regex_2 = str.match(/[>]/g);	

		if (str[0].match(">") || str[str.length-1].match(">"))
			return false;

		if (regex_2 && regex_2.length != 2)
			return false;
		if (regex_1 && regex_1.length != 1)
			return false;
		
		return true;    
	}

}

// -------------------------------------
class UML_ClassParser extends UML_ObjectParser
{
  read(reader, arr)
  {
    // read and create Class Object
		let obj = new UML_Class();
		reader.back();
		
		let headerline = true;
		
		let line;
		let classDef;
		let assoDef;
		let i;
		while (line = reader.read()) {

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
					
					if (this.validateObjectName(line, strpart[1].trim(), arr)){
						obj.name = strpart[1].trim();
						headerline = false;
					}
					else break;
				}

					if (assoDef.length > 0){
						
						let assoname;	
						let assobj;
						let superclass;
						
						let assoArr = this.defineAssociationObj(assoDef);						

						if (assoArr.length > 0){ // has interface but no super class
							superclass = assoArr[0].substring(2,assoArr[0].length).trim();
							if (superclass.length > 0){
								assobj = this.lookUpObjectByName(superclass, arr);
								if (assobj)
								{
									obj.extends(assobj);
								}else{
									this.err.push("(" + line + ") Invalid superclass! SuperClass not found.");
								}
							}
						}
						
						for (i=1; i < assoArr.length; i++){		// Interface				
							assoname = assoArr[i].trim();	
							assobj = this.lookUpObjectByName(assoname, arr);
							if (assobj)
							{
								obj.implements(assobj);
							}else{
								this.err.push("(" + line + ") Invalid association! Interface not found.");
							}							
						}
					}
				}else
					break;
			}else{

				if (line.toLowerCase().startsWith("class ") || line.toLowerCase().startsWith("interface ")) {
					reader.back();
					break; 
				}
					
				// parse line
				if (this.validateLine(line)){

					let attr_method = this.getMethodOrAttr(line);
					
					let bmethod = this.isMethod(attr_method[0]);
					
					let vis = this.getVisibility(line);
					
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
	if (!res) this.err.push("(" + str + ") Invalid inheritenance! Only one superclass allowed.");
	
	// (3) can have multiple ||	
    // (4) must be separated by a name in between
	if (res){
		res = this.checkMultipleImplement(str);
		if (!res) this.err.push("(" + str + ") Invalid association!");

	}
	// (5) >> must go first, then multiple || follows
	if (res) {
	var a = str.indexOf(">>");
	var b = str.indexOf("||");
	
	if (a>0 && b>0){
		res = (a < b);
		if (!res) this.err.push("(" + str + ") Invalid association! Inheritance first, then interface implementation.");
	}	
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

  validateLine(str){
		// Pending implementation
		// TODO:
		/*
			(1) modifier must be + - # ~
			(2) name must not contain special characters except _ and $
		*/
		// (1) modifier only appear in the first character	
		let visrx = /^[\+\-\~\#]/;
		let ovis;
		let matched = true;
	
		if (str.length > 0){
			ovis = str.trim().match(visrx);
			if (ovis == null){
				matched = false;
				if (!matched) this.err.push("(" + str + ") Invalid modifier! Should be the first character on the line.");
			}
			else{
				ovis = str.substr(1,str.len).match(visrx);
				if (ovis){
				matched = false;
				if (!matched) this.err.push("(" + str + ") Invalid modifier! Should be the first character on the line.");
				}
			}		
		}
		
		// (2) check ':' exists
		if (matched){
			matched = this.checkColonCorrect(str);
			if (!matched) this.err.push("(" + str + ") Invalid number of separator ':'");
		}
		// (3) name must not contain special characters except _ and $
		if (matched){
			if (this.isMethod(str)){
				matched = this.checkMethodNameCorrect(str);
				if (!matched) this.err.push("(" + str + ") Invalid method name! Name must not contain special characters except _ and $.");

				// check attr names must not contain special characters except _ and $
				let param;
				let i;
				let arrParam = this.getMethodParam(str);
				let arrMethod;

				for (i=0; i<arrParam.length; i++){
					param = arrParam[i].trim().split(' ');
					if (matched){
						matched = this.checkAttrTypeCorrect(param[0].trim());
						if (!matched) this.err.push("(" + str + ") Invalid attribute type! Name must not contain special characters except _ and $.");
						
						if (matched && param.length == 2){
							matched = this.checkAttrNameCorrect(param[1].trim());
							if (!matched) this.err.push("(" + str + ") Invalid attribute name! Name must not contain special characters except _ and $.");
						}else if (param.length != 2){
							matched = false;
							if (!matched) this.err.push("(" + str + ") Invalid attribute definition! Should be type + name only.");
						}
						

					}
				}
				
				if (matched){
					// return type
					arrParam = this.getMethodOrAttr(str);
					matched = this.checkAttrTypeCorrect(arrParam[1].trim());
					if (!matched) this.err.push("(" + str + ") Invalid return type definition! Type must not contain special characters except _ and $.");
				}

			}else{
				matched = this.checkAttrLineCorrect(str);
				if (!matched) this.err.push("(" + str + ") Invalid attribute definition! The name and type must not contain special characters except _ and $.");
			}
		}
		
		return matched;
  }

}

// -------------------------------------
class UML_InterfaceParser extends UML_ObjectParser
{
  read(reader, arr)
  {
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
					if (this.validateObjectName(line, strpart[1].trim(), arr)){
						obj.name = strpart[1].trim();					
						headerline = false;
					}
					else break;
				}
								
				if (assoDef.length > 0){
					
					let assoname;	
					let assobj;
					let superclass;

						superclass = assoDef.substring(2,assoDef.length).trim();
						assobj = this.lookUpObjectByName(superclass, arr);
						if (assobj)
						{
							obj.extends(assobj);
						}else{
							this.err.push("(" + line + ") Invalid Association! Interface not found.");
						}
					}			
				}else
					break;
			}else{

				if (line.toLowerCase().startsWith("class ") || line.toLowerCase().startsWith("interface ")) {
					reader.back();
					break; 
				}

				// parse line
				if (this.validateLine(line)){
					
					let vis = this.getVisibility(line);
					let attr_method = this.getMethodOrAttr(line);

					obj.addMethod(this.createUMLMethod(this.getVisibility(line), attr_method));
					
				}else{
					// Error Handling
					// TODO:
				}			
			}
		}

		return obj;
    
  }

  validateAssociationLine(str){
			
		/*
			(1) can only have one >>
			(2) must be separated by a name in between
		*/
		var res = this.checkOnlyOneExtend(str);
		if (!res) this.err.push("(" + str + ") Invalid inheritenance! Only one superclass allowed.");
		
		return res;
		
  }
  
  validateLine(str){
		// Pending implementation
		// TODO:
		// only accept methods
		/*
			(1) modifier must be + (public)
			(2) name must not contain special characters except _ and $
		*/

		// (1) modifier only appear in the first character
		let visrx = /^[\+]/;
		let ovis;
		let matched = true;
		
		if (str.length > 0){
			ovis = str.trim().match(visrx);
			if (ovis == null){
				matched = false;
				if (!matched) this.err.push("(" + str + ") Invalid modifier! Should be the first character on the line.");
			}else{
				ovis = str.substr(1,str.len).match(visrx);
				if (ovis){
				matched = false;
				if (!matched) this.err.push("(" + str + ") Invalid modifier! Should be the first character on the line.");

				}
			}
		}	
		
		// (2) check ':' exists
		if (matched){
			matched = this.checkColonCorrect(str);
			if (!matched) this.err.push("(" + str + ") Invalid number of separator ':'");
		}
		
		// (3) name must not contain special characters except _ and $
		if (matched){
			if (this.isMethod(str)){
				matched = this.checkMethodNameCorrect(str);
				if (!matched) this.err.push("(" + str + ") Invalid method name! Name must not contain special characters except _ and $.");

				// check attr names must not contain special characters except _ and $
				let param;
				let i;
				let arrParam = this.getMethodParam(str);

				for (i=0; i<arrParam.length; i++){
					param = arrParam[i].trim().split(' ');
					if (matched){
						matched = this.checkAttrTypeCorrect(param[0].trim());
						if (!matched) this.err.push("(" + str + ") Invalid attribute type! Name must not contain special characters except _ and $.");
						
						if (matched && param.length == 2){
							matched = this.checkAttrNameCorrect(param[1].trim());
							if (!matched) this.err.push("(" + str + ") Invalid attribute name! Name must not contain special characters except _ and $.");
						}else if (param.length != 2){
							matched = false;
							if (!matched) this.err.push("(" + str + ") Invalid attribute definition! Should be type + name only.");
						}
					}
				}
				if (matched){	
					// return type
					arrParam = this.getMethodOrAttr(str);
					matched = this.checkAttrTypeCorrect(arrParam[1].trim());
					if (!matched) this.err.push("(" + str + ") Invalid return type definition! Type must not contain special characters except _ and $.");
				}

			}else{
				matched = false;
				this.err.push("(" + str + ") This line should be a public method with correct syntax.");
			}
		}

		return matched;
  }  
}
