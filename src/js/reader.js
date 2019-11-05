
class LineReader
{
  constructor(text)
  {
    this.lines = text.split(/\r?\n/g);
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