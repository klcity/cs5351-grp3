class Parser
{
  constrcutor()
  {
    this.Parsers = {
      Class: new UML_ClassParser(),
      Interface: new UML_InterfaceParser(),
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
        let obj;
        // check syntax
        switch (line.toLowerCase())
        {
          // skip empty lines
          case '':
            continue;

          // switch parsers
          case 'class':
            obj = this.Parsers.Class.parse(reader);
            break;
          
          case 'interface':
            obj = this.Parsers.Interface.parse(reader);
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
    // TODO: read and create Class Object
    throw `Error found on line ${lineNumber}`;

    // accept both attributes and methods
  }
}

// -------------------------------------
class UML_InterfaceParser
{
  read(reader)
  {
    // TODO: read and create Interface Object
    throw `Error found on line ${lineNumber}`;

    // only accept methods
  }
}

function msg() {
  var val = $("#txt-syntax").val();
    return val;
}

