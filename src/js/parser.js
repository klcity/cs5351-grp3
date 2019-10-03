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
    let arr = [];
    let reader = new LineReader(raw_syntax);

    // TODO: read the text and construct models
    try
    {
      let line;
      while (line = reader.read())
      {
		let parsebool;
		let parsetype;
		let parseline;

		parseline = line.toLowerCase();
		
		if (parseline.includes("class:")){
			parsebool = true;
			parsetype = "class";
		}else if (parseline.includes("interface:")){
			parsebool = false;
			parsetype = "interface";
		}else{
			parsebool = null;
			parsetype = null;
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
      throw 'EOF';
    }

    let line;
    do { line = this.lines[this.position++]; }
    while ('#' === line[0]); // skip comments

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
	reader.position = 0;
	
	let headerline = true;
	
	let text
    let line;
    while (line = reader.read()){
		console.log("headerline: " + headerline);
		if (headerline){ 
			let strpart = line.split(":");
			if (strpart.length > 1){ // set class name			
				obj.name = strpart[1].trim();
				console.log("obj.name: " + obj.name); 
				headerline = false;
			}
		}else{
			// parse line
			let vis = getVisibility(line);
			console.log("vis: " + vis);
			let bmethod = isMethod(line);
			console.log("ismethod: " + bmethod);
			//let method = getMethodOrAttrName(line);
			//console.log(method);
			
			
		}
	}
	return obj;
	
    //throw `Error found on line ${lineNumber}`;

    // accept both attributes and methods
  }
}

// -------------------------------------
class UML_InterfaceParser
{
  read(reader)
  {
	console.log( "UML_InterfaceParser.read()");
    // TODO: read and create Interface Object
    //throw `Error found on line ${lineNumber}`;

    // only accept methods
  }
}

function getVisibility(str){
	
	let visrx = /[\+\-\@\#]/;
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

function getMethodOrAttrName(str){

}

function isMethod(str){
	
	let bmethod = false;
	
	let methodrx = /\([^)]+\)/;
	let omethod;
	
	if (str.length > 0){
		omethod = str.trim().match(methodrx);
		if (omethod){
			bmethod = true;
		}
	}
	
	return bmethod;
}


function myFunction() {
  var x = document.getElementById("txt-syntax");
  document.getElementById("sec-output").innerHTML = x.value;
}
